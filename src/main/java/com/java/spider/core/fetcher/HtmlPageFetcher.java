package com.java.spider.core.fetcher;

import com.java.spider.core.domain.PageContent;
import com.java.spider.core.domain.ScrapeConfig;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * HTML page fetcher using WebClient and Jsoup
 *
 * @author whoami
 */
@Slf4j
@Component
public class HtmlPageFetcher {

    private final WebClient webClient;

    public HtmlPageFetcher() {
        this.webClient = WebClient.builder()
                .codecs(configurer -> configurer
                        .defaultCodecs()
                        .maxInMemorySize(10 * 1024 * 1024)) // 10MB
                .build();
    }

    /**
     * Fetch HTML content from URL
     *
     * @param config scrape configuration
     * @return page content
     */
    public PageContent fetch(ScrapeConfig config) {
        try {
            String html = fetchHtmlContent(config);
            return parseHtml(config.getUrl(), html);
        } catch (Exception e) {
            log.error("Failed to fetch HTML from {}", config.getUrl(), e);
            return PageContent.builder()
                    .url(config.getUrl())
                    .success(false)
                    .errorMessage(e.getMessage())
                    .build();
        }
    }

    /**
     * Fetch raw HTML content
     */
    private String fetchHtmlContent(ScrapeConfig config) {
        WebClient.RequestHeadersSpec<?> spec = webClient.get()
                .uri(config.getUrl())
                .header("User-Agent", config.getUserAgent());

        // Add custom headers
        if (config.getHeaders() != null) {
            config.getHeaders().forEach(spec::header);
        }

        return spec.retrieve()
                .bodyToMono(String.class)
                .timeout(Duration.ofMillis(config.getTimeout()))
                .onErrorResume(e -> {
                    log.error("Error fetching URL: {}", config.getUrl(), e);
                    return Mono.just("");
                })
                .block();
    }

    /**
     * Parse HTML content using Jsoup
     */
    private PageContent parseHtml(String url, String html) {
        Document document = Jsoup.parse(html, url);

        return PageContent.builder()
                .url(url)
                .html(html)
                .text(document.text())
                .title(document.title())
                .statusCode(200)
                .success(true)
                .build();
    }

    /**
     * Extract text from specific CSS selector
     */
    public String extractText(String html, String cssSelector) {
        Document document = Jsoup.parse(html);
        Element element = document.selectFirst(cssSelector);
        return element != null ? element.text() : "";
    }

    /**
     * Extract all links from HTML
     */
    public List<String> extractLinks(String html, String baseUrl) {
        Document document = Jsoup.parse(html, baseUrl);
        Elements links = document.select("a[href]");

        List<String> urls = new ArrayList<>();
        for (Element link : links) {
            String href = link.attr("abs:href");
            if (!href.isEmpty()) {
                urls.add(href);
            }
        }
        return urls;
    }

    /**
     * Extract structured data from HTML
     */
    public Map<String, Object> extractStructuredData(String html, Map<String, String> selectors) {
        Document document = Jsoup.parse(html);
        Map<String, Object> data = new HashMap<>();

        selectors.forEach((key, selector) -> {
            Element element = document.selectFirst(selector);
            if (element != null) {
                data.put(key, element.text());
            }
        });

        return data;
    }

    /**
     * Clean HTML and extract main content
     */
    public String extractMainContent(String html) {
        Document document = Jsoup.parse(html);

        // Remove script and style elements
        document.select("script, style, nav, header, footer, aside").remove();

        // Get main content
        Element main = document.selectFirst("main, article, .content, #content");
        if (main != null) {
            return main.text();
        }

        return document.body().text();
    }
}
