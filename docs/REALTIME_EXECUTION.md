# 工作流实时执行状态实现方案

## 概述

为了实现工作流执行时的实时日志和节点动画状态，我们需要：

1. **实时日志系统**：显示每个节点的执行状态和输出
2. **节点动画状态**：高亮显示当前执行的节点
3. **进度追踪**：显示整体执行进度

## 实现方案

### 1. 使用 Server-Sent Events (SSE) 进行实时通信

修改 `/api/workflow/execute` 端点，使用流式响应：

```typescript
// app/api/workflow/execute/stream/route.ts
export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // 发送日志
      const sendLog = (log: ExecutionLog) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(log)}\n\n`));
      };

      // 执行工作流
      for (const node of nodes) {
        sendLog({
          type: 'node_start',
          nodeId: node.id,
          nodeName: node.data.label,
          timestamp: new Date().toISOString(),
        });

        try {
          const result = await executeNode(node);
          sendLog({
            type: 'node_complete',
            nodeId: node.id,
            result,
            timestamp: new Date().toISOString(),
          });
        } catch (error) {
          sendLog({
            type: 'node_error',
            nodeId: node.id,
            error: error.message,
            timestamp: new Date().toISOString(),
          });
        }
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
```

### 2. 前端实时状态更新

在工作流编辑器中添加执行状态管理：

```typescript
// components/workflow/workflow-editor.tsx

interface NodeExecutionState {
  [nodeId: string]: 'pending' | 'executing' | 'completed' | 'error';
}

const [nodeStates, setNodeStates] = useState<NodeExecutionState>({});
const [executionLogs, setExecutionLogs] = useState<ExecutionLog[]>([]);

const executeWorkflowWithStreaming = async () => {
  const response = await fetch('/api/workflow/execute/stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nodes, edges }),
  });

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const log = JSON.parse(line.slice(6));

        // 更新节点状态
        if (log.type === 'node_start') {
          setNodeStates((prev) => ({
            ...prev,
            [log.nodeId]: 'executing',
          }));
        } else if (log.type === 'node_complete') {
          setNodeStates((prev) => ({
            ...prev,
            [log.nodeId]: 'completed',
          }));
        } else if (log.type === 'node_error') {
          setNodeStates((prev) => ({
            ...prev,
            [log.nodeId]: 'error',
          }));
        }

        // 添加日志
        setExecutionLogs((prev) => [...prev, log]);
      }
    }
  }
};
```

### 3. 节点视觉状态

更新 CustomNode 组件以显示执行状态：

```typescript
// components/workflow/custom-node.tsx

export const CustomNode = memo(({ data, selected }: CustomNodeProps) => {
  const executionState = data.executionState; // 'pending' | 'executing' | 'completed' | 'error'

  const getStateStyles = () => {
    switch (executionState) {
      case 'executing':
        return 'ring-2 ring-blue-500 animate-pulse';
      case 'completed':
        return 'ring-2 ring-green-500';
      case 'error':
        return 'ring-2 ring-red-500';
      default:
        return '';
    }
  };

  return (
    <Card className={`min-w-[200px] ${getStateStyles()}`}>
      {/* 节点内容 */}
      {executionState === 'executing' && (
        <div className="absolute -top-1 -right-1">
          <div className="h-3 w-3 rounded-full bg-blue-500 animate-ping" />
        </div>
      )}
      {executionState === 'completed' && (
        <div className="absolute -top-1 -right-1">
          <div className="h-3 w-3 rounded-full bg-green-500" />
        </div>
      )}
    </Card>
  );
});
```

### 4. 执行日志面板

创建一个日志面板组件：

```typescript
// components/workflow/execution-logs-panel.tsx

export function ExecutionLogsPanel({ logs }: { logs: ExecutionLog[] }) {
  return (
    <Card className="h-full overflow-auto">
      <CardHeader>
        <CardTitle>Execution Logs</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {logs.map((log, index) => (
            <div
              key={index}
              className={`rounded p-2 text-sm ${
                log.type === 'node_start'
                  ? 'bg-blue-50'
                  : log.type === 'node_complete'
                  ? 'bg-green-50'
                  : 'bg-red-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{log.nodeName}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <div className="mt-1 text-xs">
                {log.type === 'node_start' && '⏳ Starting...'}
                {log.type === 'node_complete' && '✓ Completed'}
                {log.type === 'node_error' && `✗ Error: ${log.error}`}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
```

### 5. 进度条

添加整体进度显示：

```typescript
const totalNodes = nodes.length;
const completedNodes = Object.values(nodeStates).filter(
  state => state === 'completed' || state === 'error'
).length;
const progress = (completedNodes / totalNodes) * 100;

<Progress value={progress} className="w-full" />
<p className="text-sm text-muted-foreground">
  {completedNodes} / {totalNodes} nodes completed
</p>
```

## 使用效果

执行工作流时：

1. **节点动画**：
   - 当前执行的节点会有蓝色光环和脉冲动画
   - 完成的节点显示绿色光环
   - 失败的节点显示红色光环

2. **实时日志**：
   - 右侧面板显示每个节点的执行日志
   - 包含时间戳和状态信息
   - 自动滚动到最新日志

3. **进度追踪**：
   - 顶部显示进度条
   - 显示已完成/总节点数
   - 预计剩余时间（可选）

## 优化建议

1. **性能优化**：
   - 使用虚拟滚动处理大量日志
   - 限制日志数量，只保留最近的 N 条

2. **用户体验**：
   - 添加暂停/继续执行功能
   - 支持取消执行
   - 保存执行历史

3. **错误处理**：
   - 失败时显示详细错误信息
   - 支持重试失败的节点
   - 导出错误日志

## 下一步实现

1. 创建 `/api/workflow/execute/stream` 端点
2. 更新 CustomNode 组件添加状态样式
3. 创建 ExecutionLogsPanel 组件
4. 集成到 WorkflowEditor 中
5. 添加进度条和控制按钮
