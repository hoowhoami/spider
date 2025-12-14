package com.java.agent.core;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Agent request with conversation context
 * @author whoami
 */
@Builder
@AllArgsConstructor
@NoArgsConstructor
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

    /**
     * User action: null (new request), "confirm", "auto_confirm_session", "modify"
     */
    private String action;

}