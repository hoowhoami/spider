package com.java.agent.controller;

import com.java.agent.core.AgentExecutor;
import com.java.agent.core.AgentRequest;
import com.java.agent.core.AgentTool;
import com.java.agent.core.ToolRegistry;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/agent")
@RequiredArgsConstructor
public class AgentController {
    private final AgentExecutor executor;
    private final ToolRegistry registry;

    @PostMapping("/chat")
    public String chat(@RequestBody AgentRequest request) {
        return executor.execute(request);
    }

    @GetMapping("/tools")
    public List<AgentTool> listTools() {
        return registry.getAllTools();
    }

    @DeleteMapping("/tools/{name}")
    public void unregisterTool(@PathVariable String name) {
        registry.unregister(name);
    }
}
