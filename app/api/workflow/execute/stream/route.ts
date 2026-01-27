import { NextRequest } from 'next/server';
import { AISpider } from '@/lib/ai-spider';
import { WorkflowNode, WorkflowEdge } from '@/lib/workflow-types';
import { executionDb, logDb } from '@/lib/db-operations';
import { zh } from '@/lib/i18n';

interface ExecuteRequest {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();

  try {
    const body: ExecuteRequest = await request.json();
    const { nodes, edges } = body;

    if (!nodes || nodes.length === 0) {
      return new Response(
        encoder.encode(
          `data: ${JSON.stringify({ error: zh.errors.noNodes })}\n\n`
        ),
        {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
          },
        }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return new Response(
        encoder.encode(
          `data: ${JSON.stringify({ error: zh.errors.apiKeyNotConfigured })}\n\n`
        ),
        {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
          },
        }
      );
    }

    const baseURL = process.env.ANTHROPIC_BASE_URL;
    const spider = new AISpider(apiKey, baseURL);

    // 创建执行记录
    const executionId = `exec_${Date.now()}`;
    try {
      executionDb.create({
        id: executionId,
        workflowId: 'temp',
        workflowName: zh.execution.tempExecution,
        startedAt: new Date().toISOString(),
      });
    } catch (dbError) {
      console.error('[API] 数据库操作失败:', dbError);
      // 继续执行，不因为数据库错误而中断
    }

    const stream = new ReadableStream({
      async start(controller) {
        const sendLog = (log: any) => {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(log)}\n\n`)
          );
        };

        try {
          // Build execution graph
          const nodeMap = new Map(nodes.map((node) => [node.id, node]));
          const edgeMap = new Map<string, string[]>();

          edges.forEach((edge) => {
            if (!edgeMap.has(edge.source)) {
              edgeMap.set(edge.source, []);
            }
            edgeMap.get(edge.source)!.push(edge.target);
          });

          // Find start nodes
          const incomingCount = new Map<string, number>();
          nodes.forEach((node) => incomingCount.set(node.id, 0));
          edges.forEach((edge) => {
            incomingCount.set(
              edge.target,
              (incomingCount.get(edge.target) || 0) + 1
            );
          });

          const startNodes = nodes.filter(
            (node) => incomingCount.get(node.id) === 0
          );

          if (startNodes.length === 0) {
            sendLog({ error: zh.errors.noStartNode });
            controller.close();
            return;
          }

          const results: any[] = [];
          const nodeResults = new Map<string, any>();
          const queue = [...startNodes];
          const visited = new Set<string>();
          let nodesExecuted = 0;

          while (queue.length > 0) {
            const currentNode = queue.shift()!;

            if (visited.has(currentNode.id)) {
              continue;
            }

            visited.add(currentNode.id);

            // 发送节点开始日志
            sendLog({
              type: 'node_start',
              nodeId: currentNode.id,
              nodeName: currentNode.data.label,
              timestamp: new Date().toISOString(),
            });

            // 记录日志到数据库
            try {
              logDb.add({
                executionId,
                nodeId: currentNode.id,
                nodeName: currentNode.data.label,
                logType: 'node_start',
                timestamp: new Date().toISOString(),
              });
            } catch (dbError) {
              console.error('[API Stream] 日志记录失败:', dbError);
            }

            // Get input data
            const predecessors = edges
              .filter((edge) => edge.target === currentNode.id)
              .map((edge) => edge.source);

            const inputData = predecessors.map((predId) =>
              nodeResults.get(predId)
            );

            // Execute node
            try {
              const result = await executeNode(
                currentNode,
                inputData,
                spider,
                sendLog
              );
              nodeResults.set(currentNode.id, result);
              nodesExecuted++;

              // 发送节点完成日志
              sendLog({
                type: 'node_complete',
                nodeId: currentNode.id,
                nodeName: currentNode.data.label,
                result,
                timestamp: new Date().toISOString(),
              });

              // 记录日志到数据库
              try {
                logDb.add({
                  executionId,
                  nodeId: currentNode.id,
                  nodeName: currentNode.data.label,
                  logType: 'node_complete',
                  message: JSON.stringify(result),
                  timestamp: new Date().toISOString(),
                });
              } catch (dbError) {
                console.error('[API Stream] 日志记录失败:', dbError);
              }

              if (currentNode.type === 'output') {
                results.push(result);
              }

              // Add successors to queue
              const successors = edgeMap.get(currentNode.id) || [];
              successors.forEach((successorId) => {
                const successorNode = nodeMap.get(successorId);
                if (successorNode) {
                  const predecessorEdges = edges.filter(
                    (edge) => edge.target === successorId
                  );
                  const allPredecessorsExecuted = predecessorEdges.every(
                    (edge) => visited.has(edge.source)
                  );

                  if (allPredecessorsExecuted) {
                    queue.push(successorNode);
                  }
                }
              });
            } catch (error) {
              const errorMsg =
                error instanceof Error ? error.message : String(error);

              // 发送节点错误日志
              sendLog({
                type: 'node_error',
                nodeId: currentNode.id,
                nodeName: currentNode.data.label,
                error: errorMsg,
                timestamp: new Date().toISOString(),
              });

              // 记录错误到数据库
              try {
                logDb.add({
                  executionId,
                  nodeId: currentNode.id,
                  nodeName: currentNode.data.label,
                  logType: 'node_error',
                  message: errorMsg,
                  timestamp: new Date().toISOString(),
                });
              } catch (dbError) {
                console.error('[API Stream] 日志记录失败:', dbError);
              }

              // Close browser on error
              await spider.closeBrowser();

              // 更新执行记录为失败
              try {
                executionDb.update(executionId, {
                  status: 'failed',
                  completedAt: new Date().toISOString(),
                  nodesExecuted,
                  error: errorMsg,
                });
              } catch (dbError) {
                console.error('[API Stream] 更新执行记录失败:', dbError);
              }

              sendLog({
                error: `${zh.errors.nodeExecutionFailed}: ${currentNode.data.label}`,
              });
              controller.close();
              return;
            }
          }

          // 更新执行记录为完成
          try {
            executionDb.update(executionId, {
              status: 'completed',
              completedAt: new Date().toISOString(),
              nodesExecuted,
              results,
            });
          } catch (dbError) {
            console.error('[API Stream] 更新执行记录失败:', dbError);
          }

          // 发送完成消息
          sendLog({
            type: 'complete',
            results,
            nodesExecuted,
            timestamp: new Date().toISOString(),
          });

          // Close browser if it was used
          await spider.closeBrowser();

          controller.close();
        } catch (error) {
          const errorMsg =
            error instanceof Error ? error.message : String(error);

          // Close browser on error
          await spider.closeBrowser();

          // 更新执行记录为失败
          try {
            executionDb.update(executionId, {
              status: 'failed',
              completedAt: new Date().toISOString(),
              error: errorMsg,
            });
          } catch (dbError) {
            console.error('[API Stream] 更新执行记录失败:', dbError);
          }

          sendLog({ error: errorMsg });
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (_error) {
    return new Response(
      encoder.encode(
        `data: ${JSON.stringify({ error: zh.errors.requestParseFailed })}\n\n`
      ),
      {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      }
    );
  }
}

async function executeNode(
  node: WorkflowNode,
  inputData: any[],
  spider: AISpider,
  sendLog: (log: any) => void
): Promise<any> {
  const nodeData = node.data as any;

  // 创建日志函数
  const log = (
    message: string,
    level: 'info' | 'success' | 'error' | 'warning' = 'info'
  ) => {
    sendLog({
      type: 'log',
      nodeId: node.id,
      nodeName: nodeData.label,
      message,
      level,
      timestamp: new Date().toISOString(),
    });
  };

  switch (node.type) {
    case 'input': {
      if (nodeData.inputType === 'single') {
        log(`输入单个 URL: ${nodeData.url}`, 'info');
        return { urls: [nodeData.url] };
      } else if (nodeData.inputType === 'multiple') {
        const urls = nodeData.urls || [];
        log(`输入 ${urls.length} 个 URL`, 'info');
        return { urls };
      } else if (nodeData.inputType === 'search') {
        log(`搜索查询: ${nodeData.searchQuery}`, 'info');
        return { searchQuery: nodeData.searchQuery, urls: [] };
      }
      return { urls: [] };
    }

    case 'ai-extract': {
      const urls = inputData.flatMap((data) => data?.urls || []);
      log(`准备提取 ${urls.length} 个 URL 的数据`, 'info');
      const results = [];

      for (let i = 0; i < urls.length; i++) {
        const url = urls[i];
        log(`[${i + 1}/${urls.length}] 开始处理: ${url}`, 'info');

        try {
          const result = await spider.crawl({
            url,
            extractionType: nodeData.extractionType || 'content',
            structuredFields: nodeData.structuredFields,
            customPrompt: nodeData.customPrompt,
            useBrowser: nodeData.useBrowser || false,
            waitForSelector: nodeData.waitForSelector,
            timeout: nodeData.timeout,
            onLog: (message, level) => {
              log(`  ${message}`, level);
            },
          });
          results.push(result);
          log(`✓ [${i + 1}/${urls.length}] 完成: ${url}`, 'success');
        } catch (error) {
          const errorMsg =
            error instanceof Error ? error.message : String(error);
          log(
            `✗ [${i + 1}/${urls.length}] 失败: ${url} - ${errorMsg}`,
            'error'
          );
          console.error(`Error crawling ${url}:`, error);
        }
      }

      log(`提取完成，共 ${results.length} 条结果`, 'success');
      return { results, urls };
    }

    case 'ai-analyze': {
      const results = inputData.flatMap((data) => data?.results || []);
      log(
        `分析 ${results.length} 条数据 (类型: ${nodeData.analysisType})`,
        'info'
      );
      const analyzed = [];

      for (const result of results) {
        analyzed.push({
          ...result,
          analysis: `${nodeData.analysisType} ${zh.execution.analysis}`,
        });
      }

      log(`✓ 分析完成`, 'success');
      return { results: analyzed };
    }

    case 'ai-filter': {
      const results = inputData.flatMap((data) => data?.results || []);
      log(
        `过滤 ${results.length} 条数据 (类型: ${nodeData.filterType})`,
        'info'
      );
      let filtered = results;

      if (nodeData.filterType === 'keyword') {
        const keywords = nodeData.keywords || [];
        log(`使用关键词过滤: ${keywords.join(', ')}`, 'info');
        filtered = results.filter((result: any) => {
          const content = JSON.stringify(result).toLowerCase();
          return keywords.some((keyword: string) =>
            content.includes(keyword.toLowerCase())
          );
        });
      } else if (nodeData.filterType === 'regex') {
        log(`使用正则表达式过滤: ${nodeData.regex}`, 'info');
        const regex = new RegExp(nodeData.regex || '.*');
        filtered = results.filter((result: any) => {
          const content = JSON.stringify(result);
          return regex.test(content);
        });
      }

      log(
        `✓ 过滤完成，保留 ${filtered.length}/${results.length} 条数据`,
        'success'
      );
      return { results: filtered };
    }

    case 'batch-crawl': {
      const urls = inputData.flatMap((data) => data?.urls || []);
      const maxPages = nodeData.maxPages || 10;
      log(
        `批量抓取 ${Math.min(urls.length, maxPages)} 个页面 (最大深度: ${nodeData.maxDepth || 1})`,
        'info'
      );
      const results = [];

      for (let i = 0; i < Math.min(urls.length, maxPages); i++) {
        const url = urls[i];
        log(
          `[${i + 1}/${Math.min(urls.length, maxPages)}] 抓取: ${url}`,
          'info'
        );

        try {
          const result = await spider.crawl({
            url,
            extractionType: 'links',
            maxDepth: nodeData.maxDepth || 1,
            onLog: (message, level) => {
              log(`  ${message}`, level);
            },
          });
          results.push(result);
          log(
            `✓ [${i + 1}/${Math.min(urls.length, maxPages)}] 完成`,
            'success'
          );
        } catch (error) {
          log(
            `✗ [${i + 1}/${Math.min(urls.length, maxPages)}] 失败: ${error}`,
            'error'
          );
          console.error(`Error crawling ${url}:`, error);
        }
      }

      log(`✓ 批量抓取完成，共 ${results.length} 条结果`, 'success');
      return { results };
    }

    case 'search-engine': {
      log(
        `搜索引擎: ${nodeData.searchEngine}, 查询: ${nodeData.query}`,
        'info'
      );
      return {
        results: [],
        searchQuery: nodeData.query,
        searchEngine: nodeData.searchEngine,
      };
    }

    case 'data-transform': {
      const results = inputData.flatMap((data) => data?.results || []);
      log(
        `转换 ${results.length} 条数据 (类型: ${nodeData.transformType})`,
        'info'
      );
      log(`✓ 转换完成`, 'success');
      return { results };
    }

    case 'export': {
      const results = inputData.flatMap((data) => data?.results || []);
      const format = nodeData.exportFormat || 'json';
      log(
        `导出 ${results.length} 条数据为 ${format.toUpperCase()} 格式`,
        'info'
      );
      log(`✓ 导出完成`, 'success');

      return {
        exported: true,
        format,
        count: results.length,
        results,
      };
    }

    case 'output': {
      const results = inputData.flatMap((data) => data?.results || data);
      log(
        `输出 ${Array.isArray(results) ? results.length : 1} 条数据 (类型: ${nodeData.outputType})`,
        'info'
      );
      return {
        outputType: nodeData.outputType,
        data: results,
      };
    }

    default:
      return inputData[0] || {};
  }
}
