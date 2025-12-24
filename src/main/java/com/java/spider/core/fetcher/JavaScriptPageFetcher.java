package com.java.spider.core.fetcher;

import com.java.spider.core.domain.PageContent;
import com.java.spider.core.domain.ScrapeConfig;
import lombok.extern.slf4j.Slf4j;
import org.htmlunit.BrowserVersion;
import org.htmlunit.WebClient;
import org.htmlunit.html.HtmlPage;
import org.springframework.stereotype.Component;

/**
 * JavaScript-enabled page fetcher using HtmlUnit
 *
 * @author whoami
 */
@Slf4j
@Component
public class JavaScriptPageFetcher {

    /**
     * Fetch HTML content with JavaScript rendering
     *
     * @param config scrape configuration
     * @return page content
     */
    public PageContent fetch(ScrapeConfig config) {
        try (WebClient webClient = createWebClient(config)) {
            HtmlPage page = webClient.getPage(config.getUrl());

            // Wait for JavaScript to execute
            webClient.waitForBackgroundJavaScript(10000);

            return PageContent.builder()
                    .url(config.getUrl())
                    .html(page.asXml())
                    .text(page.asNormalizedText())
                    .title(page.getTitleText())
                    .statusCode(page.getWebResponse().getStatusCode())
                    .success(true)
                    .build();

        } catch (Exception e) {
            log.error("Failed to fetch with JS from {}", config.getUrl(), e);
            return PageContent.builder()
                    .url(config.getUrl())
                    .success(false)
                    .errorMessage(e.getMessage())
                    .build();
        }
    }

    /**
     * Create configured WebClient
     */
    private WebClient createWebClient(ScrapeConfig config) {
        WebClient webClient = new WebClient(BrowserVersion.CHROME);

        // Configure WebClient
        webClient.getOptions().setJavaScriptEnabled(true);
        webClient.getOptions().setCssEnabled(false);
        webClient.getOptions().setThrowExceptionOnScriptError(false);
        webClient.getOptions().setThrowExceptionOnFailingStatusCode(false);
        webClient.getOptions().setTimeout((int) config.getTimeout().longValue());

        // Set custom headers
        if (config.getHeaders() != null) {
            config.getHeaders().forEach(webClient::addRequestHeader);
        }

        return webClient;
    }
}
