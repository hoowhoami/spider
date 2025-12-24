package com.java.spider.core.graph;

import com.java.spider.core.domain.GraphNode;
import com.java.spider.core.domain.ScrapeConfig;
import com.java.spider.core.domain.ScrapeResult;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Graph-based crawling engine
 * Implements a pipeline of nodes for processing web crawling tasks
 *
 * @author whoami
 */
@Slf4j
@Component
public class CrawlGraphEngine {

    /**
     * Execute crawling graph
     *
     * @param rootNode root node of the graph
     * @return scrape result
     */
    public ScrapeResult executeGraph(GraphNode rootNode) {
        long startTime = System.currentTimeMillis();

        try {
            // Execute nodes in order
            executeNode(rootNode);

            // Build result from graph output
            ScrapeResult result = buildResult(rootNode);
            result.setDuration(System.currentTimeMillis() - startTime);
            result.setExtractTime(LocalDateTime.now());
            result.setSuccess(rootNode.getSuccess());

            return result;

        } catch (Exception e) {
            log.error("Graph execution failed", e);
            return ScrapeResult.builder()
                    .success(false)
                    .errorMessage(e.getMessage())
                    .duration(System.currentTimeMillis() - startTime)
                    .extractTime(LocalDateTime.now())
                    .build();
        }
    }

    /**
     * Execute a single node and its children
     */
    private void executeNode(GraphNode node) {
        try {
            log.info("Executing node: {} (type: {})", node.getName(), node.getType());

            // Node execution logic would be handled by specific node processors
            // This is a placeholder for the execution logic
            node.setSuccess(true);

            // Execute child nodes
            if (node.getChildren() != null) {
                for (GraphNode child : node.getChildren()) {
                    executeNode(child);
                }
            }

        } catch (Exception e) {
            log.error("Node execution failed: {}", node.getName(), e);
            node.setSuccess(false);
            node.setErrorMessage(e.getMessage());
        }
    }

    /**
     * Build scrape result from graph
     */
    private ScrapeResult buildResult(GraphNode rootNode) {
        return ScrapeResult.builder()
                .content(extractContent(rootNode))
                .structuredData(extractStructuredData(rootNode))
                .links(extractLinks(rootNode))
                .build();
    }

    /**
     * Extract content from graph nodes
     */
    private String extractContent(GraphNode node) {
        if (node.getOutput() instanceof String) {
            return (String) node.getOutput();
        }

        // Recursively check children
        if (node.getChildren() != null) {
            for (GraphNode child : node.getChildren()) {
                String content = extractContent(child);
                if (content != null && !content.isEmpty()) {
                    return content;
                }
            }
        }

        return null;
    }

    /**
     * Extract structured data from graph
     */
    @SuppressWarnings("unchecked")
    private java.util.Map<String, Object> extractStructuredData(GraphNode node) {
        if (node.getOutput() instanceof java.util.Map) {
            return (java.util.Map<String, Object>) node.getOutput();
        }

        if (node.getChildren() != null) {
            for (GraphNode child : node.getChildren()) {
                var data = extractStructuredData(child);
                if (data != null && !data.isEmpty()) {
                    return data;
                }
            }
        }

        return new java.util.HashMap<>();
    }

    /**
     * Extract links from graph
     */
    @SuppressWarnings("unchecked")
    private List<String> extractLinks(GraphNode node) {
        if (node.getOutput() instanceof List) {
            return (List<String>) node.getOutput();
        }

        if (node.getChildren() != null) {
            for (GraphNode child : node.getChildren()) {
                List<String> links = extractLinks(child);
                if (links != null && !links.isEmpty()) {
                    return links;
                }
            }
        }

        return new ArrayList<>();
    }

    /**
     * Create a simple linear graph for basic crawling
     */
    public GraphNode createBasicGraph(ScrapeConfig config) {
        // Root: Fetch node
        GraphNode fetchNode = GraphNode.builder()
                .id(UUID.randomUUID().toString())
                .type("fetch")
                .name("Fetch HTML")
                .input(config)
                .order(1)
                .children(new ArrayList<>())
                .build();

        // Parse node
        GraphNode parseNode = GraphNode.builder()
                .id(UUID.randomUUID().toString())
                .type("parse")
                .name("Parse HTML")
                .order(2)
                .children(new ArrayList<>())
                .build();

        // Extract node
        GraphNode extractNode = GraphNode.builder()
                .id(UUID.randomUUID().toString())
                .type("extract")
                .name("Extract Content with LLM")
                .input(config.getPrompt())
                .order(3)
                .children(new ArrayList<>())
                .build();

        // Build graph
        fetchNode.getChildren().add(parseNode);
        parseNode.getChildren().add(extractNode);

        return fetchNode;
    }

    /**
     * Create a graph for deep crawling with link following
     */
    public GraphNode createDeepCrawlingGraph(ScrapeConfig config) {
        GraphNode fetchNode = createBasicGraph(config);

        // Add link extraction node
        GraphNode linkNode = GraphNode.builder()
                .id(UUID.randomUUID().toString())
                .type("extract_links")
                .name("Extract Links")
                .order(4)
                .children(new ArrayList<>())
                .build();

        // Add filter node
        GraphNode filterNode = GraphNode.builder()
                .id(UUID.randomUUID().toString())
                .type("filter_links")
                .name("Filter Links")
                .input(config.getLinkPattern())
                .order(5)
                .children(new ArrayList<>())
                .build();

        linkNode.getChildren().add(filterNode);
        fetchNode.getChildren().add(linkNode);

        return fetchNode;
    }
}
