# LangChain4j 日志查看指南

## 📝 日志配置

项目已配置完整的日志系统，包括：

### 1. 控制台日志
实时在控制台输出日志，包括：
- 应用日志（DEBUG 级别）
- LangChain4j 日志（TRACE 级别）

### 2. 文件日志
自动保存到以下文件：
- `logs/spider.log` - 应用日志
- `logs/langchain4j.log` - LangChain4j 专用日志
- 每天自动滚动，保留历史记录

## 🔍 查看日志的方法

### 方法 1：使用日志查看脚本（推荐）

```bash
./view-logs.sh
```

提供以下功能：
1. 查看最新日志
2. 实时监控日志
3. 搜索关键词
4. 查看错误日志

### 方法 2：直接查看文件

```bash
# 查看最新的 LangChain4j 日志
tail -f logs/langchain4j.log

# 查看应用日志
tail -f logs/spider.log

# 搜索特定内容
grep "LLM Request" logs/langchain4j.log

# 查看错误
grep -i error logs/*.log
```

### 方法 3：在 IDE 中查看

运行应用时，日志会实时输出到 IDE 控制台。

## 📊 日志内容说明

### LLM 请求日志格式

```
=== LLM Request ===
Provider: OPENAI
Prompt:
You are an expert web content extractor...
==================
```

### LLM 响应日志格式

```
=== LLM Response ===
Provider: OPENAI
Response:
{"title": "...", "content": "..."}
===================
```

### 错误日志格式

```
=== LLM Error ===
Provider: OPENAI
Error: Connection timeout
=================
```

## ⚙️ 调整日志级别

编辑 `src/main/resources/application-dev.yml`：

```yaml
logging:
  level:
    # 应用日志
    com.java.spider: DEBUG

    # LangChain4j 基础日志
    dev.langchain4j: DEBUG

    # LangChain4j 详细日志（包含请求/响应）
    dev.langchain4j.model: TRACE
    dev.langchain4j.model.openai: TRACE
```

可选级别：
- `TRACE` - 最详细，包含所有 HTTP 请求/响应
- `DEBUG` - 调试信息
- `INFO` - 一般信息
- `WARN` - 警告
- `ERROR` - 仅错误

## 🐛 调试技巧

### 1. 查看完整的 LLM 交互

```bash
# 查看所有请求
grep "LLM Request" logs/langchain4j.log

# 查看所有响应
grep "LLM Response" logs/langchain4j.log
```

### 2. 查找解析错误

```bash
# 查找 JSON 解析错误
grep "Failed to parse JSON" logs/langchain4j.log

# 查看详细错误栈
grep -A 10 "JsonParseException" logs/spider.log
```

### 3. 监控实时请求

```bash
# 实时查看 LangChain4j 日志
tail -f logs/langchain4j.log | grep --line-buffered "LLM"
```

### 4. 性能分析

```bash
# 查看响应时间
grep "duration" logs/spider.log
```

## 🔧 常见问题

### Q: 日志文件太大怎么办？

A: 日志会自动按天滚动，可以调整保留天数：

编辑 `logback-spring.xml`：
```xml
<maxHistory>7</maxHistory>  <!-- 改为需要的天数 -->
```

### Q: 如何只看错误日志？

A: 使用脚本的选项 6，或者：
```bash
grep -i "error\|exception" logs/*.log
```

### Q: 如何关闭 TRACE 日志？

A: 修改 `application-dev.yml`，将 `TRACE` 改为 `DEBUG` 或 `INFO`

## 📌 使用 LLMDebugUtil

在代码中使用调试工具：

```java
import com.java.spider.util.LLMDebugUtil;

// 记录请求
LLMDebugUtil.logRequest("OPENAI", prompt);

// 记录响应
LLMDebugUtil.logResponse("OPENAI", response);

// 记录错误
LLMDebugUtil.logError("OPENAI", errorMessage);
```

## 🎯 推荐工作流

1. **开发阶段**：使用 TRACE 级别，实时查看所有请求
2. **测试阶段**：使用 DEBUG 级别，关注业务逻辑
3. **生产环境**：使用 INFO 级别，只记录关键信息

---

Happy Debugging! 🚀
