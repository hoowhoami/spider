import db from './database';
import { Workflow } from './workflow-types';

// 工作流操作
export const workflowDb = {
  // 保存工作流
  save(workflow: Workflow) {
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO workflows (id, name, description, nodes, edges, is_template, category, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    return stmt.run(
      workflow.id,
      workflow.name,
      workflow.description || null,
      JSON.stringify(workflow.nodes),
      JSON.stringify(workflow.edges),
      0,
      null,
      workflow.createdAt,
      workflow.updatedAt
    );
  },

  // 获取所有工作流
  getAll(): Workflow[] {
    const stmt = db.prepare(`
      SELECT * FROM workflows WHERE is_template = 0 ORDER BY updated_at DESC
    `);

    const rows = stmt.all() as any[];
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      nodes: JSON.parse(row.nodes),
      edges: JSON.parse(row.edges),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  },

  // 根据 ID 获取工作流
  getById(id: string): Workflow | null {
    const stmt = db.prepare('SELECT * FROM workflows WHERE id = ?');
    const row = stmt.get(id) as any;

    if (!row) return null;

    return {
      id: row.id,
      name: row.name,
      description: row.description,
      nodes: JSON.parse(row.nodes),
      edges: JSON.parse(row.edges),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  },

  // 删除工作流
  delete(id: string) {
    const stmt = db.prepare('DELETE FROM workflows WHERE id = ?');
    return stmt.run(id);
  },

  // 获取所有模板
  getTemplates(): Workflow[] {
    const stmt = db.prepare(`
      SELECT * FROM workflows WHERE is_template = 1 ORDER BY category, name
    `);

    const rows = stmt.all() as any[];
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      nodes: JSON.parse(row.nodes),
      edges: JSON.parse(row.edges),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      category: row.category,
    }));
  },

  // 保存为模板
  saveAsTemplate(workflow: Workflow, category: string) {
    const stmt = db.prepare(`
      INSERT INTO workflows (id, name, description, nodes, edges, is_template, category, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?)
    `);

    return stmt.run(
      workflow.id,
      workflow.name,
      workflow.description || null,
      JSON.stringify(workflow.nodes),
      JSON.stringify(workflow.edges),
      category,
      workflow.createdAt,
      workflow.updatedAt
    );
  },
};

// 执行历史操作
export const executionDb = {
  // 创建执行记录
  create(execution: {
    id: string;
    workflowId: string;
    workflowName: string;
    startedAt: string;
  }) {
    const stmt = db.prepare(`
      INSERT INTO execution_history (id, workflow_id, workflow_name, status, started_at, nodes_executed)
      VALUES (?, ?, ?, 'running', ?, 0)
    `);

    return stmt.run(
      execution.id,
      execution.workflowId,
      execution.workflowName,
      execution.startedAt
    );
  },

  // 更新执行状态
  update(
    id: string,
    data: {
      status?: string;
      completedAt?: string;
      nodesExecuted?: number;
      results?: any;
      error?: string;
    }
  ) {
    const updates: string[] = [];
    const values: any[] = [];

    if (data.status) {
      updates.push('status = ?');
      values.push(data.status);
    }
    if (data.completedAt) {
      updates.push('completed_at = ?');
      values.push(data.completedAt);
    }
    if (data.nodesExecuted !== undefined) {
      updates.push('nodes_executed = ?');
      values.push(data.nodesExecuted);
    }
    if (data.results) {
      updates.push('results = ?');
      values.push(JSON.stringify(data.results));
    }
    if (data.error) {
      updates.push('error = ?');
      values.push(data.error);
    }

    if (updates.length === 0) return;

    values.push(id);
    const stmt = db.prepare(`
      UPDATE execution_history SET ${updates.join(', ')} WHERE id = ?
    `);

    return stmt.run(...values);
  },

  // 获取所有执行历史
  getAll(limit = 50): any[] {
    const stmt = db.prepare(`
      SELECT * FROM execution_history ORDER BY started_at DESC LIMIT ?
    `);

    const rows = stmt.all(limit) as any[];
    return rows.map((row) => ({
      ...row,
      results: row.results ? JSON.parse(row.results) : null,
    }));
  },

  // 根据工作流 ID 获取执行历史
  getByWorkflowId(workflowId: string, limit = 20): any[] {
    const stmt = db.prepare(`
      SELECT * FROM execution_history
      WHERE workflow_id = ?
      ORDER BY started_at DESC
      LIMIT ?
    `);

    const rows = stmt.all(workflowId, limit) as any[];
    return rows.map((row) => ({
      ...row,
      results: row.results ? JSON.parse(row.results) : null,
    }));
  },

  // 删除执行历史
  delete(id: string) {
    // 先删除相关日志
    db.prepare('DELETE FROM execution_logs WHERE execution_id = ?').run(id);
    // 再删除执行记录
    const stmt = db.prepare('DELETE FROM execution_history WHERE id = ?');
    return stmt.run(id);
  },
};

// 执行日志操作
export const logDb = {
  // 添加日志
  add(log: {
    executionId: string;
    nodeId: string;
    nodeName: string;
    logType: string;
    message?: string;
    timestamp: string;
  }) {
    const stmt = db.prepare(`
      INSERT INTO execution_logs (execution_id, node_id, node_name, log_type, message, timestamp)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    return stmt.run(
      log.executionId,
      log.nodeId,
      log.nodeName,
      log.logType,
      log.message || null,
      log.timestamp
    );
  },

  // 获取执行的所有日志
  getByExecutionId(executionId: string): any[] {
    const stmt = db.prepare(`
      SELECT * FROM execution_logs WHERE execution_id = ? ORDER BY timestamp ASC
    `);

    return stmt.all(executionId) as any[];
  },
};
