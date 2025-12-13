package com.java.agent.tool;

import org.springframework.ai.support.ToolCallbacks;
import org.springframework.ai.tool.ToolCallback;

import java.util.Arrays;
import java.util.List;

/**
 * @author JLT
 * Create by 2025/12/13
 */
public abstract class AbstractAgentTool implements AgentTool {

    @Override
    public List<ToolCallback> getToolCallbacks() {
        return Arrays.stream(ToolCallbacks.from(this)).toList();
    }

}
