package com.java.agent.tool;

import org.springframework.ai.tool.ToolCallback;

import java.util.List;

/**
 * @author JLT
 * Create by 2025/12/13
 */
public interface AgentTool {

    List<ToolCallback> getToolCallbacks();

}
