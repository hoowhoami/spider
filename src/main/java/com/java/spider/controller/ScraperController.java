package com.java.spider.controller;

import com.java.spider.domain.ApiResponse;
import com.java.spider.domain.ScrapeRequest;
import com.java.spider.domain.ScrapeResponse;
import com.java.spider.core.domain.ScrapeConfig;
import com.java.spider.core.domain.ScrapeResult;
import com.java.spider.core.crawler.WebCrawlerOrchestrator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;

/**
 * Scraper REST API Controller
 *
 * @author whoami
 */
@Slf4j
@RequiredArgsConstructor
@RequestMapping("/scrape")
@RestController
public class ScraperController {

    private final WebCrawlerOrchestrator webCrawlerOrchestrator;

    /**
     * Execute scraping task
     */
    @PostMapping
    public ApiResponse<ScrapeResponse> scrape(@RequestBody ScrapeRequest request) {
        try {
            log.info("Received scrape request: url={}, mode={}", request.getUrl(), request.getMode());

            // Convert request to config
            ScrapeConfig config = buildConfig(request);

            // Execute crawling
            List<ScrapeResult> results = webCrawlerOrchestrator.crawl(config);

            // Build response
            ScrapeResponse response = buildResponse(results);

            return ApiResponse.success(response);

        } catch (Exception e) {
            log.error("Scraping failed", e);
            return ApiResponse.error(e.getMessage());
        }
    }

    /**
     * Quick scrape - single page with simple prompt
     */
    @PostMapping("/quick")
    public ApiResponse<ScrapeResponse> quickScrape(
            @RequestParam String url,
            @RequestParam String prompt
    ) {
        try {
            ScrapeResult result = webCrawlerOrchestrator.crawlSinglePage(url, prompt);

            ScrapeResponse response = ScrapeResponse.builder()
                    .success(result.getSuccess())
                    .content(result.getContent())
                    .structuredData(result.getStructuredData())
                    .links(result.getLinks())
                    .metadata(result.getMetadata())
                    .errorMessage(result.getErrorMessage())
                    .duration(result.getDuration())
                    .pagesScraped(1)
                    .build();

            return ApiResponse.success(response);

        } catch (Exception e) {
            log.error("Quick scrape failed", e);
            return ApiResponse.error(e.getMessage());
        }
    }

    /**
     * Deep scrape with link following
     */
    @PostMapping("/deep")
    public ApiResponse<ScrapeResponse> deepScrape(
            @RequestParam String url,
            @RequestParam String prompt,
            @RequestParam(defaultValue = "3") int maxDepth,
            @RequestParam(defaultValue = "10") int maxPages
    ) {
        try {
            List<ScrapeResult> results = webCrawlerOrchestrator.deepCrawl(url, prompt, maxDepth, maxPages);

            ScrapeResponse response = buildResponse(results);

            return ApiResponse.success(response);

        } catch (Exception e) {
            log.error("Deep scrape failed", e);
            return ApiResponse.error(e.getMessage());
        }
    }

    /**
     * Build scrape config from request
     */
    private ScrapeConfig buildConfig(ScrapeRequest request) {
        return ScrapeConfig.builder()
                .url(request.getUrl())
                .mode(request.getMode())
                .prompt(request.getPrompt())
                .maxDepth(request.getMaxDepth())
                .maxPages(request.getMaxPages())
                .timeout(request.getTimeout())
                .useJavaScript(request.getUseJavaScript())
                .headers(request.getHeaders())
                .cssSelector(request.getCssSelector())
                .followLinks(request.getFollowLinks())
                .linkPattern(request.getLinkPattern())
                .createTime(LocalDateTime.now())
                .build();
    }

    /**
     * Build response from results
     */
    private ScrapeResponse buildResponse(List<ScrapeResult> results) {
        if (results.isEmpty()) {
            return ScrapeResponse.builder()
                    .success(false)
                    .errorMessage("No results")
                    .pagesScraped(0)
                    .build();
        }

        // Combine results
        ScrapeResult firstResult = results.get(0);
        long totalDuration = results.stream()
                .mapToLong(r -> r.getDuration() != null ? r.getDuration() : 0L)
                .sum();

        // Merge all contents
        StringBuilder combinedContent = new StringBuilder();
        for (int i = 0; i < results.size(); i++) {
            ScrapeResult result = results.get(i);
            if (result.getSuccess() && result.getContent() != null) {
                if (i > 0) combinedContent.append("\n\n---\n\n");
                combinedContent.append("Page ").append(i + 1).append(": ").append(result.getUrl());
                combinedContent.append("\n").append(result.getContent());
            }
        }

        return ScrapeResponse.builder()
                .success(true)
                .content(combinedContent.toString())
                .structuredData(firstResult.getStructuredData())
                .links(firstResult.getLinks())
                .metadata(new HashMap<>() {{
                    put("totalPages", String.valueOf(results.size()));
                    put("successfulPages", String.valueOf(results.stream().filter(ScrapeResult::getSuccess).count()));
                }})
                .duration(totalDuration)
                .pagesScraped(results.size())
                .build();
    }
}
