package com.java.agent.core;

import lombok.Builder;
import lombok.Data;
import org.apache.commons.collections4.MapUtils;

import java.util.Map;

/**
 * Tool execution context
 */
@Data
@Builder
public class ToolContext {

    /**
     * Tool input parameters
     */
    private Map<String, Object> parameters;

    // ========== Parameter Helper Methods ==========

    public String getStringParameter(String name) {
        return MapUtils.getString(parameters, name);
    }

    public Integer getIntegerParameter(String name) {
        return MapUtils.getInteger(parameters, name);
    }

    public Double getDoubleParameter(String name) {
        return MapUtils.getDouble(parameters, name);
    }

    public Boolean getBooleanParameter(String name) {
        return MapUtils.getBoolean(parameters, name);
    }

    public Object getParameter(String name) {
        return parameters != null ? parameters.get(name) : null;
    }

}