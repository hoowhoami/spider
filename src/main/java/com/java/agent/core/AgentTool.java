package com.java.agent.core;

public interface AgentTool {

    String getName();
    String getDescription();
    String getSchema();
    String execute(ToolContext context);

}