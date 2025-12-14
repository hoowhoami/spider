package com.java.agent.core;

import com.java.agent.config.SystemPromptConfig;
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
 * Agent executor with automatic tool execution
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

    /**
     * Handle chat with automatic tool execution
     */
    public AgentResponse chat(AgentRequest request) {
        String conversationId = getOrGenerateConversationId(request);
        List<ToolCallback> toolCallbacks = getToolCallbacks();

        log.info("Processing chat request for conversation: {}", conversationId);

        String response = builder.build()
                .prompt()
                .system(SystemPromptConfig.SYSTEM_PROMPT)
                .user(request.getPrompt())
                .toolCallbacks(toolCallbacks)
                .advisors(messageChatMemoryAdvisor)
                .advisors(spec -> spec.param(ChatMemory.CONVERSATION_ID, conversationId))
                .call()
                .content();

        return AgentResponse.ok(conversationId, response);
    }

    private String getOrGenerateConversationId(AgentRequest request) {
        String conversationId = request.getConversationId();
        if (StringUtils.isBlank(conversationId)) {
            conversationId = UUID.randomUUID().toString();
            log.info("Generated new conversation ID: {}", conversationId);
        }
        return conversationId;
    }

    private List<ToolCallback> getToolCallbacks() {
        return tools.stream()
                .flatMap(tool -> tool.getToolCallbacks().stream())
                .toList();
    }
}
