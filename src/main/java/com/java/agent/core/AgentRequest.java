package com.java.agent.core;

import lombok.Data;

/**
 * Agent request with conversation context
 */
@Data
public class AgentRequest {

    /**
     * Conversation ID for multi-turn dialogue
     * Will be auto-generated if not provided
     */
    private String conversationId;

    /**
     * User prompt/question
     */
    private String prompt;

}