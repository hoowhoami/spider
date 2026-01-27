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
    executionDb.create({
      id: executionId,
      workflowId: 'temp',
      workflowName: zh.execution.tempExecution,
      startedAt: new Date().toISOString(),
    });

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
            logDb.add({
              executionId,
              nodeId: currentNode.id,
              nodeName: currentNode.data.label,
              logType: 'node_start',
              timestamp: new Date().toISOString(),
            });

            // Get input data
            const predecessors = edges
              .filter((edge) => edge.target === currentNode.id)
              .map((edge) => edge.source);

            const inputData = predecessors.map((predId) =>
              nodeResults.get(predId)
            );

            // Execute node
            try {
              const result = await executeNode(currentNode, inputData, spider);
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
              logDb.add({
                executionId,
                nodeId: currentNode.id,
                nodeName: currentNode.data.label,
                logType: 'node_complete',
                message: JSON.stringify(result),
                timestamp: new Date().toISOString(),
              });

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
              logDb.add({
                executionId,
                nodeId: currentNode.id,
                nodeName: currentNode.data.label,
                logType: 'node_error',
                message: errorMsg,
                timestamp: new Date().toISOString(),
              });

              // 更新执行记录为失败
              executionDb.update(executionId, {
                status: 'failed',
                completedAt: new Date().toISOString(),
                nodesExecuted,
                error: errorMsg,
              });

              sendLog({
                error: `${zh.errors.nodeExecutionFailed}: ${currentNode.data.label}`,
              });
              controller.close();
              return;
            }
          }

          // 更新执行记录为完成
          executionDb.update(executionId, {
            status: 'completed',
            completedAt: new Date().toISOString(),
            nodesExecuted,
            results,
          });

          // 发送完成消息
          sendLog({
            type: 'complete',
            results,
            nodesExecuted,
            timestamp: new Date().toISOString(),
          });

          controller.close();
        } catch (error) {
          const errorMsg =
            error instanceof Error ? error.message : String(error);

          // 更新执行记录为失败
          executionDb.update(executionId, {
            status: 'failed',
            completedAt: new Date().toISOString(),
            error: errorMsg,
          });

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
  spider: AISpider
): Promise<any> {
  const nodeData = node.data as any;

  switch (node.type) {
    case 'input': {
      if (nodeData.inputType === 'single') {
        return { urls: [nodeData.url] };
      } else if (nodeData.inputType === 'multiple') {
        return { urls: nodeData.urls || [] };
      } else if (nodeData.inputType === 'search') {
        return { searchQuery: nodeData.searchQuery, urls: [] };
      }
      return { urls: [] };
    }

    case 'ai-extract': {
      const urls = inputData.flatMap((data) => data?.urls || []);
      const results = [];

      for (const url of urls) {
        try {
          const result = await spider.crawl({
            url,
            extractionType: nodeData.extractionType || 'content',
            structuredFields: nodeData.structuredFields,
          });
          results.push(result);
        } catch (error) {
          console.error(`Error crawling ${url}:`, error);
        }
      }

      return { results, urls };
    }

    case 'ai-analyze': {
      const results = inputData.flatMap((data) => data?.results || []);
      const analyzed = [];

      for (const result of results) {
        analyzed.push({
          ...result,
          analysis: `${nodeData.analysisType} ${zh.execution.analysis}`,
        });
      }

      return { results: analyzed };
    }

    case 'ai-filter': {
      const results = inputData.flatMap((data) => data?.results || []);
      let filtered = results;

      if (nodeData.filterType === 'keyword') {
        const keywords = nodeData.keywords || [];
        filtered = results.filter((result: any) => {
          const content = JSON.stringify(result).toLowerCase();
          return keywords.some((keyword: string) =>
            content.includes(keyword.toLowerCase())
          );
        });
      } else if (nodeData.filterType === 'regex') {
        const regex = new RegExp(nodeData.regex || '.*');
        filtered = results.filter((result: any) => {
          const content = JSON.stringify(result);
          return regex.test(content);
        });
      }

      return { results: filtered };
    }

    case 'batch-crawl': {
      const urls = inputData.flatMap((data) => data?.urls || []);
      const results = [];

      for (const url of urls.slice(0, nodeData.maxPages || 10)) {
        try {
          const result = await spider.crawl({
            url,
            extractionType: 'links',
            maxDepth: nodeData.maxDepth || 1,
          });
          results.push(result);
        } catch (error) {
          console.error(`Error crawling ${url}:`, error);
        }
      }

      return { results };
    }

    case 'search-engine': {
      return {
        results: [],
        searchQuery: nodeData.query,
        searchEngine: nodeData.searchEngine,
      };
    }

    case 'data-transform': {
      const results = inputData.flatMap((data) => data?.results || []);
      return { results };
    }

    case 'export': {
      const results = inputData.flatMap((data) => data?.results || []);
      const format = nodeData.exportFormat || 'json';

      return {
        exported: true,
        format,
        count: results.length,
        results,
      };
    }

    case 'output': {
      const results = inputData.flatMap((data) => data?.results || data);
      return {
        outputType: nodeData.outputType,
        data: results,
      };
    }

    default:
      return inputData[0] || {};
  }
}
