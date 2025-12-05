package com.java.agent.core;

public interface ToolPlugin extends AgentTool {

    default void onLoad() {}
    default void onUnload() {}

}