# AI Spider - 快速开始

## 项目概述

AI Spider 是一个基于 Claude AI 的智能网页爬虫系统，采用可视化工作流编辑器设计，支持复杂的爬取流程。

## 核心特性

- ✅ 可视化工作流编辑器
- ✅ 9 种节点类型（输入、AI 处理、爬取、转换、输出）
- ✅ SQLite 数据库存储
- ✅ 执行结果查看
- ✅ 工作流管理（保存、加载、导出、导入）
- ⏳ 实时执行状态（开发中）
- ⏳ 执行历史记录（开发中）
- ⏳ 工作流模板库（开发中）

## 安装和运行

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

创建 `.env.local` 文件：

```env
ANTHROPIC_API_KEY=your_api_key_here
```

### 3. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

### 4. 构建生产版本

```bash
npm run build
npm start
```

## 使用指南

### 创建工作流

1. **添加节点**
   - 从左侧面板拖拽节点到画布
   - 支持的节点类型：
     - URL 输入
     - AI 提取
     - AI 分析
     - AI 过滤
     - 批量爬取
     - 数据转换
     - 导出
     - 输出

2. **连接节点**
   - 从节点底部圆点拖拽到另一个节点顶部圆点
   - 数据从上到下流动

3. **配置节点**
   - 点击节点
   - 在右侧面板配置参数

4. **执行工作流**
   - 点击顶部"执行"按钮
   - 查看右侧结果面板

### 管理工作流

**保存工作流：**

```
点击"保存"按钮 → 自动保存到 SQLite 数据库
```

**查看已保存的工作流：**

```
点击"工作流"按钮 → 右侧显示列表 → 点击加载图标
```

**导出工作流：**

```
点击"导出"按钮 → 下载 JSON 文件
```

**导入工作流：**

```
点击"导入"按钮 → 选择 JSON 文件
```

## 数据存储

### SQLite 数据库

数据库文件位置：`/data/spider.db`

**表结构：**

1. **workflows** - 工作流和模板
2. **execution_history** - 执行历史
3. **execution_logs** - 执行日志

### 备份数据

```bash
# 备份数据库
cp data/spider.db data/spider_backup_$(date +%Y%m%d).db

# 恢复数据库
cp data/spider_backup_20240101.db data/spider.db
```

## 开发指南

### 项目结构

```
/app
  - page.tsx              # 首页（工作流编辑器）
  - layout.tsx            # 布局
  /api
    /workflow/execute     # 工作流执行 API

/components/workflow
  - workflow-editor.tsx   # 主编辑器
  - custom-node.tsx       # 自定义节点
  - node-panel.tsx        # 节点面板
  - node-config-panel.tsx # 配置面板
  - results-panel.tsx     # 结果面板
  - workflow-list-panel.tsx # 工作流列表

/lib
  - database.ts           # 数据库初始化
  - db-operations.ts      # 数据库操作
  - ai-spider.ts          # AI 爬虫核心
  - workflow-types.ts     # 类型定义
  - i18n.ts              # 中文文本

/data
  - spider.db            # SQLite 数据库
```

### 添加新节点类型

1. 在 `/lib/workflow-types.ts` 添加类型定义
2. 在 `/components/workflow/custom-node.tsx` 添加图标和颜色
3. 在 `/components/workflow/node-panel.tsx` 添加节点模板
4. 在 `/components/workflow/node-config-panel.tsx` 添加配置界面
5. 在 `/app/api/workflow/execute/route.ts` 实现执行逻辑

### 调试

```bash
# 查看数据库内容
sqlite3 data/spider.db
> SELECT * FROM workflows;
> SELECT * FROM execution_history;

# 清空数据库
> DELETE FROM workflows;
> DELETE FROM execution_history;
> DELETE FROM execution_logs;
```

## 常见问题

### Q: 数据库文件在哪里？

A: `/data/spider.db`，首次运行时自动创建。

### Q: 如何迁移 localStorage 数据？

A: 暂不支持自动迁移，需要手动导出工作流后重新导入。

### Q: 执行失败怎么办？

A: 检查：

1. ANTHROPIC_API_KEY 是否配置
2. 节点配置是否正确
3. 浏览器控制台错误信息

### Q: 如何清空所有数据？

A: 删除 `/data/spider.db` 文件，重启服务器会自动创建新数据库。

## 后续开发计划

### 第一阶段（当前）

- [x] 基础工作流编辑器
- [x] SQLite 数据库
- [x] 工作流管理
- [ ] 界面中文化

### 第二阶段

- [ ] 实时执行状态
- [ ] 节点执行动画
- [ ] 执行日志面板

### 第三阶段

- [ ] 执行历史记录
- [ ] 历史查看和管理

### 第四阶段

- [ ] 工作流模板库
- [ ] 预设模板
- [ ] 保存为模板

## 技术支持

- 查看文档：`/docs` 目录
- 提交问题：GitHub Issues
- 实现方案：`/docs/IMPLEMENTATION_SUMMARY.md`

## 许可证

MIT License
