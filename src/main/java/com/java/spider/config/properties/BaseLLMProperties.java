package com.java.spider.config.properties;

import lombok.Data;

/**
 * @author whoami
 * Create by 2025/12/24
 */
@Data
public class BaseLLMProperties {

    /**
     * llm base url
     */
    private String baseUrl;
    private String apiKey;
    private String modelName = "";
    private Double temperature = 0.7;
    private Integer maxTokens = 2000;
    private Long timeout = 60L;
    private Integer maxRetries = 10;

}
