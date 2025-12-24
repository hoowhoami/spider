package com.java.spider.core.crawler;

import com.java.spider.enums.ScrapeMode;
import com.java.spider.core.domain.ScrapeConfig;
import com.java.spider.core.domain.ScrapeResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;

/**
 * Web crawler orchestrator - coordinates different crawling strategies
 *
 * @author whoami
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class WebCrawlerOrchestrator {

    private final SmartCrawler smartCrawler;
    private final DeepCrawler deepCrawler;

    /**
     * Execute crawling based on configuration
     *
     * @param config scrape configuration
     * @return scrape results
     */
    public List<ScrapeResult> crawl(ScrapeConfig config) {
        log.info("Starting crawl task: mode={}, url={}", config.getMode(), config.getUrl());

        return switch (config.getMode()) {
            case SMART_SCRAPER -> {
                ScrapeResult result = smartCrawler.crawl(config);
                yield Collections.singletonList(result);
            }
            case DEEP_SCRAPER -> deepCrawler.crawl(config);
            case SEARCH_SCRAPER -> {
                // To be implemented
                log.warn("SEARCH_SCRAPER mode not yet implemented");
                yield Collections.emptyList();
            }
            case CUSTOM_SCRAPER -> {
                // To be implemented
                log.warn("CUSTOM_SCRAPER mode not yet implemented");
                yield Collections.emptyList();
            }
        };
    }

    /**
     * Crawl single page (shortcut for SMART_SCRAPER)
     *
     * @param url    target URL
     * @param prompt LLM prompt
     * @return scrape result
     */
    public ScrapeResult crawlSinglePage(String url, String prompt) {
        ScrapeConfig config = ScrapeConfig.builder()
                .url(url)
                .mode(ScrapeMode.SMART_SCRAPER)
                .prompt(prompt)
                .build();

        return smartCrawler.crawl(config);
    }

    /**
     * Deep crawl with link following
     *
     * @param url       target URL
     * @param prompt    LLM prompt
     * @param maxDepth  maximum depth
     * @param maxPages  maximum pages
     * @return list of scrape results
     */
    public List<ScrapeResult> deepCrawl(String url, String prompt, int maxDepth, int maxPages) {
        ScrapeConfig config = ScrapeConfig.builder()
                .url(url)
                .mode(ScrapeMode.DEEP_SCRAPER)
                .prompt(prompt)
                .maxDepth(maxDepth)
                .maxPages(maxPages)
                .followLinks(true)
                .build();

        return deepCrawler.crawl(config);
    }
}
