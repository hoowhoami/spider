package com.java.spider.core.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Scrape result
 *
 * @author whoami
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScrapeResult {

    /**
     * Source URL
     */
    private String url;

    /**
     * Extracted content (LLM output)
     */
    private String content;

    /**
     * Raw HTML
     */
    private String rawHtml;

    /**
     * Structured data extracted by LLM
     */
    private Map<String, Object> structuredData;

    /**
     * Metadata
     */
    private Map<String, String> metadata;

    /**
     * Links found on the page
     */
    private java.util.List<String> links;

    /**
     * Extraction time
     */
    private LocalDateTime extractTime;

    /**
     * Processing duration in milliseconds
     */
    private Long duration;

    /**
     * Whether extraction was successful
     */
    private Boolean success;

    /**
     * Error message if failed
     */
    private String errorMessage;
}
