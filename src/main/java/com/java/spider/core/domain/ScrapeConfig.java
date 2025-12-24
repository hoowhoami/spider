package com.java.spider.core.domain;

import com.java.spider.enums.ScrapeMode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Scrape task configuration
 *
 * @author whoami
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScrapeConfig {

    /**
     * Target URL to scrape
     */
    private String url;

    /**
     * Scraping mode
     */
    private ScrapeMode mode;

    /**
     * Prompt for LLM to extract information
     */
    private String prompt;

    /**
     * Maximum depth for deep scraping
     */
    @Builder.Default
    private Integer maxDepth = 3;

    /**
     * Maximum number of pages to scrape
     */
    @Builder.Default
    private Integer maxPages = 10;

    /**
     * Request timeout in milliseconds
     */
    @Builder.Default
    private Long timeout = 30000L;

    /**
     * Whether to use JavaScript rendering
     */
    @Builder.Default
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
     * Whether to follow links
     */
    @Builder.Default
    private Boolean followLinks = false;

    /**
     * Link pattern regex for filtering
     */
    private String linkPattern;

    /**
     * User agent
     */
    @Builder.Default
    private String userAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36";

    /**
     * Rate limit - requests per second
     */
    @Builder.Default
    private Double rateLimit = 1.0;

    /**
     * Creation time
     */
    private LocalDateTime createTime;
}
