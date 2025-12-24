package com.java.spider.domain;

import com.java.spider.enums.LLMProvider;
import com.java.spider.enums.ScrapeMode;
import lombok.Data;

import java.util.Map;

/**
 * Scrape request DTO
 *
 * @author whoami
 */
@Data
public class ScrapeRequest {

    /**
     * Target URL
     */
    private String url;

    /**
     * Scraping mode
     */
    private ScrapeMode mode = ScrapeMode.SMART_SCRAPER;

    /**
     * LLM prompt for extraction
     */
    private String prompt;

    /**
     * LLM provider
     */
    private LLMProvider llmProvider;

    /**
     * Maximum depth for deep scraping
     */
    private Integer maxDepth = 3;

    /**
     * Maximum pages to scrape
     */
    private Integer maxPages = 10;

    /**
     * Request timeout in milliseconds
     */
    private Long timeout = 30000L;

    /**
     * Use JavaScript rendering
     */
    private Boolean useJavaScript = false;

    /**
     * Custom headers
     */
    private Map<String, String> headers;

    /**
     * CSS selector for content extraction
     */
    private String cssSelector;

    /**
     * Follow links
     */
    private Boolean followLinks = false;

    /**
     * Link pattern regex
     */
    private String linkPattern;

    /**
     * Task name
     */
    private String taskName;
}
