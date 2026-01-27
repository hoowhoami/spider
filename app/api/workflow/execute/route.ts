import { NextRequest, NextResponse } from 'next/server';
import { AISpider } from '@/lib/ai-spider';
import { WorkflowNode, WorkflowEdge } from '@/lib/workflow-types';

interface ExecuteRequest {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export async function POST(request: NextRequest) {
  try {
    const body: ExecuteRequest = await request.json();
    const { nodes, edges } = body;

    if (!nodes || nodes.length === 0) {
      return NextResponse.json({ error: 'No nodes provided' }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY not configured' },
        { status: 500 }
      );
    }

    const baseURL = process.env.ANTHROPIC_BASE_URL;
    const spider = new AISpider(apiKey, baseURL);

    // Build execution graph
    const nodeMap = new Map(nodes.map((node) => [node.id, node]));
    const edgeMap = new Map<string, string[]>();

    // Build adjacency list
    edges.forEach((edge) => {
      if (!edgeMap.has(edge.source)) {
        edgeMap.set(edge.source, []);
      }
      edgeMap.get(edge.source)!.push(edge.target);
    });

    // Find start nodes (nodes with no incoming edges)
    const incomingCount = new Map<string, number>();
    nodes.forEach((node) => incomingCount.set(node.id, 0));
    edges.forEach((edge) => {
      incomingCount.set(edge.target, (incomingCount.get(edge.target) || 0) + 1);
    });

    const startNodes = nodes.filter((node) => incomingCount.get(node.id) === 0);

    if (startNodes.length === 0) {
      return NextResponse.json(
        {
          error:
            'No start node found. Workflow must have at least one node with no incoming connections.',
        },
        { status: 400 }
      );
    }

    // Execute workflow using topological sort
    const results: any[] = [];
    const nodeResults = new Map<string, any>();
    const queue = [...startNodes];
    const visited = new Set<string>();

    while (queue.length > 0) {
      const currentNode = queue.shift()!;

      if (visited.has(currentNode.id)) {
        continue;
      }

      visited.add(currentNode.id);

      // Get input data from predecessor nodes
      const predecessors = edges
        .filter((edge) => edge.target === currentNode.id)
        .map((edge) => edge.source);

      const inputData = predecessors.map((predId) => nodeResults.get(predId));

      // Execute current node
      try {
        const result = await executeNode(currentNode, inputData, spider);
        nodeResults.set(currentNode.id, result);

        if (currentNode.type === 'output') {
          results.push(result);
        }

        // Add successor nodes to queue
        const successors = edgeMap.get(currentNode.id) || [];
        successors.forEach((successorId) => {
          const successorNode = nodeMap.get(successorId);
          if (successorNode) {
            // Check if all predecessors have been executed
            const predecessorEdges = edges.filter(
              (edge) => edge.target === successorId
            );
            const allPredecessorsExecuted = predecessorEdges.every((edge) =>
              visited.has(edge.source)
            );

            if (allPredecessorsExecuted) {
              queue.push(successorNode);
            }
          }
        });
      } catch (error) {
        console.error(`Error executing node ${currentNode.id}:`, error);
        return NextResponse.json(
          {
            error: `Node execution failed: ${currentNode.data.label}`,
            details: error instanceof Error ? error.message : String(error),
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      results,
      nodesExecuted: visited.size,
    });
  } catch (error) {
    console.error('Workflow execution error:', error);
    return NextResponse.json(
      {
        error: 'Workflow execution failed',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
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
        // For now, return the search query
        // In a real implementation, you would call a search API
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
        // Use AI to analyze the content
        const _analysisPrompt = getAnalysisPrompt(
          nodeData.analysisType,
          nodeData.customPrompt,
          result
        );

        // For now, just pass through with analysis type
        analyzed.push({
          ...result,
          analysis: `${nodeData.analysisType} analysis`,
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
      // In a real implementation, you would call a search engine API
      // For now, return mock data
      return {
        results: [],
        searchQuery: nodeData.query,
        searchEngine: nodeData.searchEngine,
      };
    }

    case 'data-transform': {
      const results = inputData.flatMap((data) => data?.results || []);
      // Apply transformation based on transformType
      return { results };
    }

    case 'export': {
      const results = inputData.flatMap((data) => data?.results || []);
      const format = nodeData.exportFormat || 'json';

      // In a real implementation, you would save to file or database
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

function getAnalysisPrompt(
  analysisType: string,
  customPrompt: string | undefined,
  data: any
): string {
  if (customPrompt) {
    return customPrompt;
  }

  switch (analysisType) {
    case 'summary':
      return `Summarize the following content: ${JSON.stringify(data)}`;
    case 'sentiment':
      return `Analyze the sentiment of the following content: ${JSON.stringify(data)}`;
    case 'classification':
      return `Classify the following content: ${JSON.stringify(data)}`;
    default:
      return `Analyze the following content: ${JSON.stringify(data)}`;
  }
}
