package com.java.spider.core.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

/**
 * Graph node for scraping workflow
 *
 * @author whoami
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GraphNode {

    /**
     * Node ID
     */
    private String id;

    /**
     * Node type (fetch, parse, extract, transform, etc.)
     */
    private String type;

    /**
     * Node name
     */
    private String name;

    /**
     * Input data
     */
    private Object input;

    /**
     * Output data
     */
    private Object output;

    /**
     * Child nodes
     */
    @Builder.Default
    private List<GraphNode> children = new ArrayList<>();

    /**
     * Node metadata
     */
    private java.util.Map<String, Object> metadata;

    /**
     * Whether node execution was successful
     */
    private Boolean success;

    /**
     * Error message if failed
     */
    private String errorMessage;

    /**
     * Execution order
     */
    private Integer order;
}
