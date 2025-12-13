package com.java.agent.controller;

import com.java.agent.core.AgentExecutor;
import com.java.agent.core.AgentRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * @author whoami
 */
@RequiredArgsConstructor
@RequestMapping("/api/agent")
@RestController
public class AgentController {

    private final AgentExecutor executor;

    @PostMapping("/chat")
    public String chat(@RequestBody AgentRequest request) {
        return executor.execute(request);
    }

}
