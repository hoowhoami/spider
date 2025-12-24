package com.java.spider.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * Scrape response DTO
 *
 * @author whoami
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScrapeResponse {

    /**
     * Success flag
     */
    private Boolean success;

    /**
     * Task ID
     */
    private Long taskId;

    /**
     * Extracted content
     */
    private String content;

    /**
     * Structured data
     */
    private Map<String, Object> structuredData;

    /**
     * Links found
     */
    private List<String> links;

    /**
     * Metadata
     */
    private Map<String, String> metadata;

    /**
     * Error message
     */
    private String errorMessage;

    /**
     * Duration in milliseconds
     */
    private Long duration;

    /**
     * Pages scraped
     */
    private Integer pagesScraped;
}
