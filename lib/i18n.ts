// 中文文本配置
export const zh = {
  // 节点类型
  nodeTypes: {
    start: '开始',
    end: '结束',
    input: 'URL 输入',
    'ai-extract': 'AI 提取',
    'ai-analyze': 'AI 分析',
    'ai-filter': 'AI 过滤',
    'batch-crawl': '批量爬取',
    'search-engine': '搜索引擎',
    'data-transform': '数据转换',
    export: '导出',
    output: '输出',
  },

  // 节点描述
  nodeDescriptions: {
    start: 'Workflow 开始节点',
    end: 'Workflow 结束节点',
    input: '输入单个或多个 URL',
    'ai-extract': '使用 AI 提取内容',
    'ai-analyze': '使用 AI 分析内容',
    'ai-filter': '智能过滤结果',
    'batch-crawl': '批量爬取多个页面',
    'search-engine': '从搜索结果爬取',
    'data-transform': '转换数据结构',
    export: '导出到文件或数据库',
    output: '显示或下载结果',
  },

  // 工具栏
  toolbar: {
    workflows: '工作流',
    templates: '模板',
    history: '历史',
    import: '导入',
    export: '导出',
    save: '保存',
    clear: '清空',
    execute: '执行',
    executing: '执行中...',
  },

  // 面板标题
  panels: {
    nodes: '节点',
    nodeConfig: '节点配置',
    config: '配置',
    executionResults: '执行结果',
    results: '结果',
    executionLogs: '执行日志',
    logs: '日志',
    savedWorkflows: '已保存的工作流',
    templates: '工作流模板',
    executionHistory: '执行历史',
    history: '历史',
  },

  // 配置字段
  config: {
    label: '标签',
    description: '描述',
    // Start node
    triggerType: '触发类型',
    manual: '手动触发',
    schedule: '定时触发',
    webhook: 'Webhook触发',
    // End node
    action: '结束动作',
    none: '无',
    notify: '发送通知',
    // Input node
    inputType: '输入类型',
    singleUrl: '单个 URL',
    multipleUrls: '多个 URL',
    searchQuery: '搜索查询',
    url: 'URL',
    urls: 'URL 列表（每行一个）',
    // AI Extract node
    extractionType: '提取类型',
    content: '内容',
    structured: '结构化数据',
    links: '链接',
    analysis: '分析',
    structuredFields: '字段（逗号分隔）',
    customPrompt: '自定义提示词（可选）',
    // AI Analyze node
    analysisType: '分析类型',
    summary: '摘要',
    sentiment: '情感',
    classification: '分类',
    custom: '自定义',
    // AI Filter node
    filterType: '过滤类型',
    keyword: '关键词',
    aiCondition: 'AI 条件',
    regex: '正则表达式',
    keywords: '关键词（逗号分隔）',
    condition: 'AI 条件',
    regexPattern: '正则表达式模式',
    // Batch Crawl node
    maxDepth: '最大深度',
    maxPages: '最大页面数',
    // Search Engine node
    searchEngine: '搜索引擎',
    query: '搜索查询',
    maxResults: '最大结果数',
    // Export node
    exportFormat: '导出格式',
    filename: '文件名',
    // Output node
    outputType: '输出类型',
    display: '显示',
    download: '下载',
    api: 'API 响应',
  },

  // 消息
  messages: {
    noWorkflow: '没有工作流',
    addNodesFirst: '请先添加节点到工作流',
    executingWorkflow: '正在执行工作流',
    workflowExecuting: '工作流正在执行中...',
    executionComplete: '执行完成',
    processedItems: '处理了 {count} 项',
    executionFailed: '执行失败',
    workflowSaved: '工作流已保存',
    workflowSavedSuccess: '"{name}" 已成功保存',
    workflowCleared: '工作流已清空',
    allNodesRemoved: '所有节点和连接已被移除',
    confirmClear: '确定要清空工作流吗？此操作无法撤销。',
    workflowExported: '工作流已导出',
    exportedAsJson: '工作流已下载为 JSON 文件',
    workflowImported: '工作流已导入',
    workflowLoaded: '"{name}" 已加载',
    importFailed: '导入失败',
    invalidWorkflowFile: '无效的工作流文件',
    confirmDelete: '确定要删除此工作流吗？',
    noSavedWorkflows: '没有已保存的工作流。创建并保存一个工作流以在此处查看。',
    selectNodeToConfig: '选择一个节点进行配置',
    executeToSeeResults: '执行工作流以查看结果',
    noResults: '没有结果显示',
  },

  // 状态
  status: {
    success: '成功',
    failed: '失败',
    running: '运行中',
    pending: '等待中',
    completed: '已完成',
    error: '错误',
  },

  // 按钮
  buttons: {
    close: '关闭',
    download: '下载',
    delete: '删除',
    load: '加载',
    saveAsTemplate: '保存为模板',
    useTemplate: '使用模板',
  },

  // 统计
  stats: {
    nodesExecuted: '已执行节点',
    resultsCount: '结果数量',
    nodes: '节点',
    connections: '连接',
    lastUpdated: '最后更新',
  },

  // 通用
  common: {
    loading: '加载中...',
    uncategorized: '未分类',
    untitledWorkflow: '未命名工作流',
    system: '系统',
    status: '状态',
    startTime: '开始时间',
    endTime: '完成时间',
    executedNodes: '执行节点',
    error: '错误',
    viewResults: '查看结果',
    delete: '删除',
    nodesCount: '个节点',
    connectionsCount: '个连接',
  },

  // 错误消息
  errors: {
    loadTemplateFailed: '加载模板失败',
    getHistoryFailed: '获取历史记录失败',
    missingId: '缺少 ID',
    deleteFailed: '删除失败',
    getTemplateFailed: '获取模板失败',
    saveTemplateFailed: '保存模板失败',
    loadHistoryFailed: '加载历史记录失败',
    deleteHistoryFailed: '删除失败',
    noNodes: '没有节点',
    apiKeyNotConfigured: 'ANTHROPIC_API_KEY 未配置',
    noStartNode: '没有找到起始节点',
    nodeExecutionFailed: '节点执行失败',
    requestParseFailed: '请求解析失败',
  },

  // 模板面板
  templatePanel: {
    title: '工作流模板',
    noTemplates: '暂无模板。保存工作流为模板以在此处查看。',
  },

  // 历史面板
  historyPanel: {
    title: '执行历史',
    noHistory: '暂无执行历史记录',
    confirmDelete: '确定要删除此执行记录吗？',
  },

  // 执行日志面板
  logsPanel: {
    title: '执行日志',
    noLogs: '执行工作流以查看日志',
    startExecution: '⏳ 开始执行...',
    executionComplete: '✓ 执行完成',
    executionError: '✗ 错误',
    workflowComplete: '✓ 工作流执行完成',
  },

  // 执行相关
  execution: {
    tempExecution: '临时执行',
    analysis: '分析',
  },

  // 工作流管理
  workflow: {
    management: '工作流管理',
    managementDescription: '创建、编辑和管理您的 AI 爬虫工作流',
    createNew: '创建新工作流',
    noWorkflows: '还没有工作流',
    noWorkflowsDescription: '创建您的第一个工作流开始使用',
    edit: '编辑',
    duplicate: '复制',
    export: '导出',
    delete: '删除',
    confirmDelete: '确定要删除工作流 "{name}" 吗？',
    deleted: '工作流已删除',
    deleteFailed: '删除失败',
    duplicated: '工作流已复制',
    duplicateFailed: '复制失败',
    exported: '工作流已导出',
    exportFailed: '导出失败',
    loadError: '加载工作流失败',
    untitled: '未命名工作流',
    copy: '副本',
    updatedAt: '更新于',
    justNow: '刚刚',
    minutesAgo: '{count}分钟前',
    hoursAgo: '{count}小时前',
    daysAgo: '{count}天前',
    nodesCount: '{count} 个节点',
    edgesCount: '{count} 个连接',
  },

  // 应用元数据
  metadata: {
    title: 'AI Spider - 智能网页爬虫',
    description: '基于 Claude Agent SDK 的 AI 驱动网页爬虫系统',
  },
};

export type Translations = typeof zh;
