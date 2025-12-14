package com.java.agent.core;

import lombok.Data;

/**
 * Agent response
 *
 * @author whoami
 */
@Data
public class AgentResponse {

    private String conversationId;
    private String status;
    private String content;

    public static AgentResponse ok(String conversationId, String content) {
        AgentResponse response = new AgentResponse();
        response.conversationId = conversationId;
        response.status = "success";
        response.content = content;
        return response;
    }

}
