package com.java.spider.enums;

/**
 * Scraping mode enumeration
 *
 * @author whoami
 */
public enum ScrapeMode {

    /**
     * Smart scraper - Extract specific information from a single page
     */
    SMART_SCRAPER,

    /**
     * Search scraper - Search and extract from multiple pages
     */
    SEARCH_SCRAPER,

    /**
     * Deep scraper - Recursively scrape linked pages
     */
    DEEP_SCRAPER,

    /**
     * Custom scraper - User-defined scraping logic
     */
    CUSTOM_SCRAPER
}
