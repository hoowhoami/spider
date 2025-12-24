#!/bin/bash

# LangChain4j 日志查看脚本

LOG_DIR="logs"
LANGCHAIN_LOG="$LOG_DIR/langchain4j.log"
APP_LOG="$LOG_DIR/spider.log"

echo "================================"
echo "  LangChain4j 日志查看工具"
echo "================================"
echo ""
echo "选择操作："
echo "1. 查看 LangChain4j 日志 (最新 50 行)"
echo "2. 查看应用日志 (最新 50 行)"
echo "3. 实时监控 LangChain4j 日志"
echo "4. 实时监控应用日志"
echo "5. 搜索 LangChain4j 日志"
echo "6. 查看错误日志"
echo ""
read -p "请输入选项 (1-6): " choice

case $choice in
    1)
        if [ -f "$LANGCHAIN_LOG" ]; then
            echo ""
            echo "=== LangChain4j 日志 (最新 50 行) ==="
            tail -n 50 "$LANGCHAIN_LOG"
        else
            echo "日志文件不存在: $LANGCHAIN_LOG"
        fi
        ;;
    2)
        if [ -f "$APP_LOG" ]; then
            echo ""
            echo "=== 应用日志 (最新 50 行) ==="
            tail -n 50 "$APP_LOG"
        else
            echo "日志文件不存在: $APP_LOG"
        fi
        ;;
    3)
        if [ -f "$LANGCHAIN_LOG" ]; then
            echo ""
            echo "=== 实时监控 LangChain4j 日志 (Ctrl+C 退出) ==="
            tail -f "$LANGCHAIN_LOG"
        else
            echo "日志文件不存在: $LANGCHAIN_LOG"
        fi
        ;;
    4)
        if [ -f "$APP_LOG" ]; then
            echo ""
            echo "=== 实时监控应用日志 (Ctrl+C 退出) ==="
            tail -f "$APP_LOG"
        else
            echo "日志文件不存在: $APP_LOG"
        fi
        ;;
    5)
        read -p "请输入搜索关键词: " keyword
        if [ -f "$LANGCHAIN_LOG" ]; then
            echo ""
            echo "=== 搜索结果: '$keyword' ==="
            grep -i "$keyword" "$LANGCHAIN_LOG" | tail -n 50
        else
            echo "日志文件不存在: $LANGCHAIN_LOG"
        fi
        ;;
    6)
        echo ""
        echo "=== 错误日志 (最新 50 条) ==="
        if [ -f "$LANGCHAIN_LOG" ]; then
            grep -i "error\|exception" "$LANGCHAIN_LOG" | tail -n 50
        fi
        if [ -f "$APP_LOG" ]; then
            grep -i "error\|exception" "$APP_LOG" | tail -n 50
        fi
        ;;
    *)
        echo "无效选项"
        ;;
esac
