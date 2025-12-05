package com.java.agent.core;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.tool.ToolCallback;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

/**
 * Agent executor with conversation memory support
 * Supports multi-turn conversations with automatic history management
 */
@Slf4j
@RequiredArgsConstructor
@Component
public class AgentExecutor {

    private final ChatClient.Builder builder;
    private final ToolRegistry toolRegistry;
    private final MessageChatMemoryAdvisor messageChatMemoryAdvisor;

    public String execute(AgentRequest request) {
        // Get or generate conversation ID
        String conversationId = request.getConversationId();
        if (StringUtils.isBlank(conversationId)) {
            conversationId = UUID.randomUUID().toString();
            log.info("Generated new conversation ID: {}", conversationId);
        } else {
            log.info("Using existing conversation ID: {}", conversationId);
        }

        final String finalConversationId = conversationId;

        try {
            // Get all registered tools from registry
            List<AgentTool> tools = toolRegistry.getAllTools();
            log.info("Executing with {} registered tools for conversation {}", tools.size(), conversationId);

            // Convert plugins to ToolCallbacks
            List<ToolCallback> toolCallbacks = tools.stream()
                    .filter(tool -> tool instanceof ToolPlugin)
                    .map(tool -> ToolCallbackAdapter.from((ToolPlugin) tool))
                    .toList();

            log.debug("Created {} tool callbacks", toolCallbacks.size());

            // Build ChatClient with MessageChatMemoryAdvisor
            ChatClient chatClient = builder
                    .defaultAdvisors(messageChatMemoryAdvisor)  // 添加对话历史记忆 Advisor
                    .build();

            // Execute chat with tools and conversation memory
            // conversationId 通过 advisorParams 传递给 MessageChatMemoryAdvisor
            return chatClient
                    .prompt()
                    .user(request.getPrompt())
                    .advisors(spec -> spec
                            .param(ChatMemory.CONVERSATION_ID, finalConversationId))  // 传递会话ID
                    .toolCallbacks(toolCallbacks)
                    .call()
                    .content();
        } catch (Exception e) {
            log.error("Error executing agent for conversation {}: {}", finalConversationId, e.getMessage(), e);
            throw e;
        }
    }
}