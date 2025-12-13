package com.java.agent.core;

import com.java.agent.tool.AgentTool;
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
 * Agent executor with conversation memory and automatic tool discovery
 *
 * @author whoami
 */
@Slf4j
@RequiredArgsConstructor
@Component
public class AgentExecutor {

    private final ChatClient.Builder builder;
    private final MessageChatMemoryAdvisor messageChatMemoryAdvisor;
    private final List<AgentTool> tools;

    public String execute(AgentRequest request) {
        String conversationId = request.getConversationId();
        if (StringUtils.isBlank(conversationId)) {
            conversationId = UUID.randomUUID().toString();
            log.info("Generated new conversation ID: {}", conversationId);
        } else {
            log.info("Using existing conversation ID: {}", conversationId);
        }

        final String finalConversationId = conversationId;

        try {

            List<ToolCallback> toolCallbacks = tools.stream()
                    .flatMap(tool -> tool.getToolCallbacks().stream())
                    .toList();

            log.info("Executing with {} tools for conversation {}", toolCallbacks.size(), conversationId);

            return builder
                    .build()
                    .prompt()
                    .user(request.getPrompt())
                    .advisors(messageChatMemoryAdvisor)
                    .advisors(spec -> spec.param(ChatMemory.CONVERSATION_ID, finalConversationId))
                    .toolCallbacks(toolCallbacks)
                    .call()
                    .content();
        } catch (Exception e) {
            log.error("Error executing agent for conversation {}: {}", finalConversationId, e.getMessage(), e);
            throw e;
        }
    }
}