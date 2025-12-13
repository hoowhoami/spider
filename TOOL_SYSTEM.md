# AI Agent 工具系统使用文档

## 系统架构

本项目已重构为基于 Spring AI `@Tool` 注解的自然语言驱动 AI Agent 系统。

### 核心特性

- ✅ **自动工具发现**: 使用 `@Tool` 注解，Spring AI 自动发现并注册工具
- ✅ **对话记忆**: 支持多轮对话，自动管理历史记录
- ✅ **工具编排**: AI 自动理解意图，选择并调用多个工具完成任务
- ✅ **安全控制**: 内置 SQL 注入防护、白名单验证等安全机制

## 已实现的工具

### 1. CalculatorTool - 计算器
```java
@Tool(description = "Perform basic arithmetic operations...")
public String calculate(String expression)
```

**示例**:
- "计算 (3+5)*2"
- "2+2 等于多少"

### 2. WeatherTool - 天气查询
```java
@Tool(description = "Get weather information for a city...")
public String getWeather(String city)
```

**示例**:
- "查询北京的天气"
- "上海今天天气怎么样"

### 3. SQLTool - 数据库查询 ⚠️
```java
@Tool(description = "Execute SQL query and return results...")
public String executeQuery(String sql)
```

**安全限制**:
- 只允许 SELECT 查询
- 表白名单: orders, customers, products, spring_ai_chat_memory
- 自动检测 SQL 注入

**示例**:
- "查询订单表中金额大于1000的记录"
- "统计客户总数"

### 4. HttpTool - HTTP API 调用
```java
@Tool(description = "Make HTTP GET request...")
public String httpGet(String url)

@Tool(description = "Make HTTP POST request...")
public String httpPost(String url, String body)
```

**示例**:
- "调用 https://api.example.com/data 获取数据"
- "POST 请求到 https://api.example.com/notify"

### 5. EmailTool - 邮件发送
```java
@Tool(description = "Send an email...")
public String sendEmail(String to, String subject, String content)
```

**示例**:
- "发送邮件给 admin@company.com，主题是报告，内容是..."

## 如何创建新工具

### 步骤 1: 创建工具类

在 `com.java.agent.tool` 包下创建新的 `@Component` 类：

```java
package com.java.agent.tool;

import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class MyCustomTool {

    @Tool(description = "工具功能描述，AI 会根据这个描述决定何时调用此工具")
    public String myFunction(String param1, int param2) {
        // 实现工具逻辑
        log.info("Executing myFunction with param1={}, param2={}", param1, param2);

        // 返回结果（必须是 String）
        return "执行结果";
    }
}
```

### 步骤 2: 重启应用

Spring AI 会自动发现并注册新工具，无需手动配置。

### 最佳实践

1. **清晰的描述**: `description` 要详细说明工具的功能、参数含义、使用场景
2. **参数验证**: 在方法开始时验证参数有效性
3. **异常处理**: 捕获异常并返回友好的错误信息
4. **日志记录**: 记录工具调用和执行结果
5. **安全考虑**: 对敏感操作添加白名单、权限检查等

## 使用示例

### 单工具调用

**请求**:
```json
{
  "prompt": "计算 100 * 50",
  "conversationId": "conv-123"
}
```

**AI 执行流程**:
1. 理解意图: 需要进行数学计算
2. 选择工具: CalculatorTool.calculate
3. 生成参数: expression="100*50"
4. 执行并返回: "5000.00"

### 多工具编排

**请求**:
```json
{
  "prompt": "查询订单表中金额超过10000的订单，并将结果发送邮件给 finance@company.com",
  "conversationId": "conv-456"
}
```

**AI 执行流程**:
1. 理解意图: 查询数据 + 发送邮件
2. 第一步: 调用 SQLTool.executeQuery
   - SQL: "SELECT * FROM orders WHERE amount > 10000"
   - 结果: [{order_id: 1, amount: 15000}, ...]
3. 第二步: 调用 EmailTool.sendEmail
   - to: "finance@company.com"
   - subject: "高额订单报告"
   - content: "共找到 3 笔订单..."
4. 返回: "已查询到 3 笔订单，邮件已发送"

### 对话记忆

系统自动管理对话历史，支持上下文引用：

```
用户: "查询订单表中的数据"
AI: "已查询到 100 条订单记录"

用户: "把这些数据发送给财务部门"  // AI 会记住之前查询的结果
AI: "邮件已发送给 finance@company.com"
```

## API 接口

### POST /api/agent/execute

**请求体**:
```json
{
  "prompt": "用户的自然语言指令",
  "conversationId": "可选，用于多轮对话"
}
```

**响应**:
```json
{
  "result": "AI 执行结果"
}
```

## 安全配置

### SQLTool 安全配置

编辑 `SQLTool.java`:

```java
// 修改允许的表白名单
private static final Set<String> ALLOWED_TABLES = Set.of(
    "orders", "customers", "products", "your_table"
);
```

### HttpTool 安全配置

编辑 `HttpTool.java`:

```java
// 启用域名白名单（生产环境推荐）
private static final Set<String> ALLOWED_DOMAINS = Set.of(
    "api.example.com",
    "internal.company.com"
);

// 在 validateUrl 方法中取消注释白名单检查
```

### EmailTool 安全配置

编辑 `EmailTool.java`:

```java
// 启用收件人域名白名单
private static final Set<String> ALLOWED_DOMAINS = Set.of(
    "company.com"
);
```

## 监控与日志

所有工具调用都会记录日志：

```
2024-12-13 14:00:00 INFO  AgentExecutor - Executing with 5 auto-discovered tools for conversation conv-123
2024-12-13 14:00:01 INFO  SQLTool - Executing SQL query: SELECT * FROM orders WHERE amount > 10000
2024-12-13 14:00:02 INFO  EmailTool - Sending email to: finance@company.com, subject: 高额订单报告
```

## 故障排查

### 工具未被发现

**问题**: AI 提示 "没有可用的工具"

**解决**:
1. 确认类上有 `@Component` 注解
2. 确认方法上有 `@Tool` 注解
3. 确认类在 `com.java.agent.tool` 包下
4. 检查应用启动日志中的工具数量

### SQL 执行失败

**问题**: "SQL contains dangerous keywords"

**解决**:
1. 确认只使用 SELECT 语句
2. 确认查询的表在白名单中
3. 检查 SQL 语法是否正确

### HTTP 请求失败

**问题**: "URL domain not in whitelist"

**解决**:
1. 将目标域名添加到 `ALLOWED_DOMAINS`
2. 或在测试环境中注释掉白名单检查

## 性能优化

1. **缓存**: 对频繁查询的数据添加缓存
2. **异步**: 对耗时操作使用异步执行
3. **限流**: 添加 API 调用频率限制
4. **超时**: 设置合理的超时时间

## 下一步扩展

可以继续添加的工具：

- **FileTool**: 文件读写操作
- **DatabaseTool**: 支持多数据源
- **NotificationTool**: 多渠道通知（短信、钉钉、企业微信）
- **ScheduleTool**: 定时任务管理
- **ReportTool**: 报表生成
- **DataAnalysisTool**: 数据分析和可视化

## 技术栈

- Spring Boot 4.0.0
- Spring AI 2.0.0-SNAPSHOT
- OpenAI API
- MySQL (对话历史存储)
- Lombok

## 联系方式

如有问题，请联系开发团队。
