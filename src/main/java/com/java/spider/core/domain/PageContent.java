package com.java.spider.core.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * HTML page content
 *
 * @author whoami
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PageContent {

    /**
     * URL
     */
    private String url;

    /**
     * HTML content
     */
    private String html;

    /**
     * Text content (extracted from HTML)
     */
    private String text;

    /**
     * Page title
     */
    private String title;

    /**
     * Status code
     */
    private Integer statusCode;

    /**
     * Content type
     */
    private String contentType;

    /**
     * Response headers
     */
    private java.util.Map<String, String> headers;

    /**
     * Whether fetch was successful
     */
    private Boolean success;

    /**
     * Error message if failed
     */
    private String errorMessage;
}
