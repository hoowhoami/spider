package com.java.agent.controller;

import com.java.agent.core.AgentRequest;
import com.java.agent.core.AgentResponse;
import com.java.agent.core.AgentExecutor;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * Agent REST API
 * @author whoami
 */
@RestController
@RequestMapping("/api/agent")
@RequiredArgsConstructor
public class AgentController {

    private final AgentExecutor agentExecutor;

    @PostMapping("/chat")
    public AgentResponse chat(@RequestBody AgentRequest request) {
        return agentExecutor.chat(request);
    }
}
