package com.java.agent.tool;

import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

/**
 * HTTP tool - makes HTTP API calls with security controls
 * @author whoami
 */
@Slf4j
@Component
public class HttpTool extends AbstractAgentTool {

    private final RestTemplate restTemplate;

    public HttpTool() {
        this.restTemplate = new RestTemplate();
        this.restTemplate.getInterceptors().add((request, body, execution) -> {
            request.getHeaders().set("User-Agent", "AI-Agent/1.0");
            return execution.execute(request, body);
        });
    }

    @Tool(description = "Make HTTP GET request to an API endpoint. Returns the response body as string.")
    public String httpGet(String url) {
        if (url == null || url.trim().isEmpty()) {
            throw new IllegalArgumentException("URL cannot be null or empty");
        }

        log.info("Making HTTP GET request to: {}", url);
        validateUrl(url);

        try {
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                return String.format("HTTP GET successful (Status: %d):\n%s",
                        response.getStatusCode().value(), response.getBody());
            } else {
                return String.format("HTTP GET failed with status: %d", response.getStatusCode().value());
            }

        } catch (Exception e) {
            log.error("Error making HTTP GET request to: {}", url, e);
            throw new RuntimeException("HTTP request failed: " + e.getMessage(), e);
        }
    }

    @Tool(description = "Make HTTP POST request to an API endpoint with JSON body. Parameters: url (API endpoint), body (JSON string).")
    public String httpPost(String url, String body) {
        if (url == null || url.trim().isEmpty()) {
            throw new IllegalArgumentException("URL cannot be null or empty");
        }

        log.info("Making HTTP POST request to: {}", url);
        validateUrl(url);

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<String> httpEntity = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(url, httpEntity, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                return String.format("HTTP POST successful (Status: %d):\n%s",
                        response.getStatusCode().value(), response.getBody());
            } else {
                return String.format("HTTP POST failed with status: %d", response.getStatusCode().value());
            }

        } catch (Exception e) {
            log.error("Error making HTTP POST request to: {}", url, e);
            throw new RuntimeException("HTTP request failed: " + e.getMessage(), e);
        }
    }

    private void validateUrl(String url) {
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
            throw new SecurityException("URL must start with http:// or https://");
        }
    }
}
