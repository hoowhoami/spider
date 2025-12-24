package com.java.spider.core.crawler;

import com.java.spider.core.extractor.ContentExtractor;
import com.java.spider.core.fetcher.HtmlPageFetcher;
import com.java.spider.core.fetcher.JavaScriptPageFetcher;
import com.java.spider.core.domain.PageContent;
import com.java.spider.core.domain.ScrapeConfig;
import com.java.spider.core.domain.ScrapeResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.HashMap;

/**
 * Smart crawler - Extract specific information from a single page using LLM
 *
 * @author whoami
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class SmartCrawler {

    private final HtmlPageFetcher htmlPageFetcher;
    private final JavaScriptPageFetcher javaScriptPageFetcher;
    private final ContentExtractor contentExtractor;

    /**
     * Execute smart crawling
     *
     * @param config scrape configuration
     * @return scrape result
     */
    public ScrapeResult crawl(ScrapeConfig config) {
        long startTime = System.currentTimeMillis();

        try {
            // Step 1: Fetch HTML
            PageContent pageContent = fetchPage(config);

            if (!pageContent.getSuccess()) {
                return buildFailureResult(config.getUrl(), pageContent.getErrorMessage(), startTime);
            }

            // Step 2: Extract content with LLM
            String extractedContent = contentExtractor.extractContent(pageContent, config.getPrompt());

            // Step 3: Extract structured data if needed
            var structuredData = contentExtractor.extractStructuredData(
                    pageContent,
                    config.getPrompt(),
                    null
            );

            // Step 4: Extract links
            var links = htmlPageFetcher.extractLinks(pageContent.getHtml(), config.getUrl());

            return ScrapeResult.builder()
                    .url(config.getUrl())
                    .content(extractedContent)
                    .rawHtml(pageContent.getHtml())
                    .structuredData(structuredData)
                    .links(links)
                    .metadata(new HashMap<>() {{
                        put("title", pageContent.getTitle());
                        put("statusCode", String.valueOf(pageContent.getStatusCode()));
                    }})
                    .success(true)
                    .duration(System.currentTimeMillis() - startTime)
                    .extractTime(LocalDateTime.now())
                    .build();

        } catch (Exception e) {
            log.error("Smart crawling failed for {}", config.getUrl(), e);
            return buildFailureResult(config.getUrl(), e.getMessage(), startTime);
        }
    }

    /**
     * Fetch page content based on configuration
     */
    private PageContent fetchPage(ScrapeConfig config) {
        if (config.getUseJavaScript()) {
            return javaScriptPageFetcher.fetch(config);
        } else {
            return htmlPageFetcher.fetch(config);
        }
    }

    /**
     * Build failure result
     */
    private ScrapeResult buildFailureResult(String url, String errorMessage, long startTime) {
        return ScrapeResult.builder()
                .url(url)
                .success(false)
                .errorMessage(errorMessage)
                .duration(System.currentTimeMillis() - startTime)
                .extractTime(LocalDateTime.now())
                .build();
    }
}
