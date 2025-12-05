package com.java.agent.core;

import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Component;

@Component
public class ToolValidator {

    public void validate(AgentTool tool) {
        if (StringUtils.isBlank(tool.getName())) {
            throw new IllegalArgumentException("Tool name cannot be blank");
        }
        if (StringUtils.isBlank(tool.getDescription())) {
            throw new IllegalArgumentException("Tool description cannot be blank");
        }
    }

}
