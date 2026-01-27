import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbDir = path.join(process.cwd(), 'data');
const dbPath = path.join(dbDir, 'spider.db');

// 确保数据目录存在
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);

// 初始化数据库表
export function initDatabase() {
  // 工作流表
  db.exec(`
    CREATE TABLE IF NOT EXISTS workflows (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      nodes TEXT NOT NULL,
      edges TEXT NOT NULL,
      is_template INTEGER DEFAULT 0,
      category TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  // 执行历史表
  db.exec(`
    CREATE TABLE IF NOT EXISTS execution_history (
      id TEXT PRIMARY KEY,
      workflow_id TEXT NOT NULL,
      workflow_name TEXT NOT NULL,
      status TEXT NOT NULL,
      started_at TEXT NOT NULL,
      completed_at TEXT,
      nodes_executed INTEGER DEFAULT 0,
      results TEXT,
      error TEXT,
      FOREIGN KEY (workflow_id) REFERENCES workflows(id)
    )
  `);

  // 执行日志表
  db.exec(`
    CREATE TABLE IF NOT EXISTS execution_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      execution_id TEXT NOT NULL,
      node_id TEXT NOT NULL,
      node_name TEXT NOT NULL,
      log_type TEXT NOT NULL,
      message TEXT,
      timestamp TEXT NOT NULL,
      FOREIGN KEY (execution_id) REFERENCES execution_history(id)
    )
  `);

  // 创建索引
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_workflows_template ON workflows(is_template);
    CREATE INDEX IF NOT EXISTS idx_workflows_category ON workflows(category);
    CREATE INDEX IF NOT EXISTS idx_execution_history_workflow ON execution_history(workflow_id);
    CREATE INDEX IF NOT EXISTS idx_execution_history_status ON execution_history(status);
    CREATE INDEX IF NOT EXISTS idx_execution_logs_execution ON execution_logs(execution_id);
  `);
}

// 初始化数据库
initDatabase();

export default db;
