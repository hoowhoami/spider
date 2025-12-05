package com.java.agent.core;

import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.tool.ToolCallback;
import org.springframework.ai.tool.definition.DefaultToolDefinition;
import org.springframework.ai.tool.definition.ToolDefinition;
import org.springframework.ai.tool.execution.ToolExecutionException;
import org.springframework.ai.tool.function.FunctionToolCallback;

import java.util.Map;

/**
 * Adapter to convert ToolPlugin to Spring AI ToolCallback
 */
@Slf4j
public class ToolCallbackAdapter {

    /**
     * Create a ToolCallback from a ToolPlugin
     *
     * @param plugin the tool plugin to adapt
     * @return a Spring AI ToolCallback
     */
    public static ToolCallback from(ToolPlugin plugin) {
        // Build ToolDefinition for this plugin
        ToolDefinition toolDefinition = DefaultToolDefinition.builder()
                .name(plugin.getName())
                .description(plugin.getDescription())
                .inputSchema(plugin.getSchema())
                .build();
        return FunctionToolCallback.<Map<String, Object>, String>builder(
                        plugin.getName(),
                        params -> {
                            log.debug("Executing tool {} with params: {}", plugin.getName(), params);

                            // Validate parameters
                            if (params == null) {
                                String error = "Parameters cannot be null";
                                throw new ToolExecutionException(toolDefinition, new IllegalArgumentException(error));
                            }

                            // Create ToolContext
                            ToolContext context = ToolContext.builder()
                                    .parameters(params)
                                    .build();

                            try {
                                // Execute plugin
                                String result = plugin.execute(context);

                                // Validate result
                                if (result == null) {
                                    throw new ToolExecutionException(
                                            toolDefinition,
                                            new IllegalStateException("Tool execution returned null result")
                                    );
                                }

                                log.debug("Tool {} returned: {}", plugin.getName(), result);
                                return result;

                            } catch (ToolExecutionException e) {
                                // Re-throw ToolExecutionException as-is
                                throw e;

                            } catch (Exception e) {
                                // Wrap all other exceptions in ToolExecutionException
                                throw new ToolExecutionException(toolDefinition, e);
                            }
                        }
                )
                .description(plugin.getDescription())
                .inputType(Map.class)
                .inputSchema(plugin.getSchema())
                .build();
    }

}
