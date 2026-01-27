// Workflow node types and data structures

export type NodeType =
  | 'input'
  | 'ai-extract'
  | 'ai-analyze'
  | 'ai-filter'
  | 'batch-crawl'
  | 'search-engine'
  | 'data-transform'
  | 'export'
  | 'output';

export interface BaseNodeData {
  label: string;
  description?: string;
}

export interface InputNodeData extends BaseNodeData {
  url?: string;
  urls?: string[];
  inputType: 'single' | 'multiple' | 'search';
  searchQuery?: string;
}

export interface AIExtractNodeData extends BaseNodeData {
  extractionType: 'content' | 'structured' | 'links' | 'analysis';
  structuredFields?: string[];
  customPrompt?: string;
}

export interface AIAnalyzeNodeData extends BaseNodeData {
  analysisType: 'summary' | 'sentiment' | 'classification' | 'custom';
  customPrompt?: string;
}

export interface AIFilterNodeData extends BaseNodeData {
  filterType: 'keyword' | 'ai-condition' | 'regex';
  condition?: string;
  keywords?: string[];
  regex?: string;
}

export interface BatchCrawlNodeData extends BaseNodeData {
  maxDepth: number;
  maxPages: number;
  followLinks: boolean;
}

export interface SearchEngineNodeData extends BaseNodeData {
  searchEngine: 'google' | 'bing' | 'duckduckgo';
  query: string;
  maxResults: number;
}

export interface DataTransformNodeData extends BaseNodeData {
  transformType: 'map' | 'filter' | 'reduce' | 'custom';
  transformScript?: string;
}

export interface ExportNodeData extends BaseNodeData {
  exportFormat: 'json' | 'csv' | 'excel' | 'database';
  filename?: string;
  databaseConfig?: {
    type: string;
    connection: string;
  };
}

export interface OutputNodeData extends BaseNodeData {
  outputType: 'display' | 'download' | 'api';
}

export type WorkflowNodeData =
  | InputNodeData
  | AIExtractNodeData
  | AIAnalyzeNodeData
  | AIFilterNodeData
  | BatchCrawlNodeData
  | SearchEngineNodeData
  | DataTransformNodeData
  | ExportNodeData
  | OutputNodeData;

export interface WorkflowNode {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  data: WorkflowNodeData;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt: string;
  completedAt?: string;
  results?: unknown[];
  error?: string;
  progress: number;
}

export interface NodeExecutionResult {
  nodeId: string;
  status: 'success' | 'error';
  data?: unknown;
  error?: string;
  timestamp: string;
}
