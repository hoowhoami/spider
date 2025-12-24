package com.java.spider.core.crawler;

import com.java.spider.core.fetcher.HtmlPageFetcher;
import com.java.spider.core.fetcher.JavaScriptPageFetcher;
import com.java.spider.core.domain.ScrapeConfig;
import com.java.spider.core.domain.ScrapeResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * Deep crawler - Recursively crawl linked pages
 *
 * @author whoami
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DeepCrawler {

    private final HtmlPageFetcher htmlPageFetcher;
    private final JavaScriptPageFetcher javaScriptPageFetcher;
    private final SmartCrawler smartCrawler;

    /**
     * Execute deep crawling
     *
     * @param config scrape configuration
     * @return list of scrape results
     */
    public List<ScrapeResult> crawl(ScrapeConfig config) {
        List<ScrapeResult> results = new ArrayList<>();
        Set<String> visitedUrls = new HashSet<>();
        Queue<UrlDepth> urlQueue = new LinkedList<>();

        // Start with initial URL
        urlQueue.offer(new UrlDepth(config.getUrl(), 0));

        while (!urlQueue.isEmpty() && results.size() < config.getMaxPages()) {
            UrlDepth current = urlQueue.poll();

            // Skip if already visited or max depth reached
            if (visitedUrls.contains(current.url) || current.depth > config.getMaxDepth()) {
                continue;
            }

            visitedUrls.add(current.url);

            try {
                // Crawl current page
                ScrapeConfig pageConfig = ScrapeConfig.builder()
                        .url(current.url)
                        .prompt(config.getPrompt())
                        .timeout(config.getTimeout())
                        .useJavaScript(config.getUseJavaScript())
                        .headers(config.getHeaders())
                        .userAgent(config.getUserAgent())
                        .build();

                ScrapeResult result = smartCrawler.crawl(pageConfig);
                results.add(result);

                // Extract and queue links if followLinks is enabled
                if (config.getFollowLinks() && result.getSuccess() && current.depth < config.getMaxDepth()) {
                    List<String> filteredLinks = filterLinks(result.getLinks(), config, current.url);

                    for (String link : filteredLinks) {
                        if (!visitedUrls.contains(link) && results.size() < config.getMaxPages()) {
                            urlQueue.offer(new UrlDepth(link, current.depth + 1));
                        }
                    }
                }

                // Rate limiting
                if (config.getRateLimit() > 0) {
                    Thread.sleep((long) (1000.0 / config.getRateLimit()));
                }

            } catch (Exception e) {
                log.error("Failed to crawl {}", current.url, e);
            }
        }

        return results;
    }

    /**
     * Filter links based on pattern and domain
     */
    private List<String> filterLinks(List<String> links, ScrapeConfig config, String baseUrl) {
        if (links == null || links.isEmpty()) {
            return new ArrayList<>();
        }

        String baseDomain = extractDomain(baseUrl);
        Pattern linkPattern = config.getLinkPattern() != null
                ? Pattern.compile(config.getLinkPattern())
                : null;

        return links.stream()
                .filter(link -> {
                    // Same domain check
                    if (!extractDomain(link).equals(baseDomain)) {
                        return false;
                    }

                    // Pattern check
                    if (linkPattern != null && !linkPattern.matcher(link).matches()) {
                        return false;
                    }

                    // Exclude common non-content links
                    return !link.contains("#") &&
                            !link.endsWith(".pdf") &&
                            !link.endsWith(".jpg") &&
                            !link.endsWith(".png") &&
                            !link.endsWith(".gif");
                })
                .distinct()
                .collect(Collectors.toList());
    }

    /**
     * Extract domain from URL
     */
    private String extractDomain(String url) {
        try {
            java.net.URL netUrl = new java.net.URL(url);
            return netUrl.getHost();
        } catch (Exception e) {
            return "";
        }
    }

    /**
     * Helper class to track URL and depth
     */
    private static class UrlDepth {
        String url;
        int depth;

        UrlDepth(String url, int depth) {
            this.url = url;
            this.depth = depth;
        }
    }
}
