package com.java.spider.config;

import com.java.spider.config.properties.LLMProperties;
import com.java.spider.core.factory.LLMClientFactory;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * @author whoami
 * Create by 2025/12/24
 */
@EnableConfigurationProperties(LLMProperties.class)
@Configuration
public class LLMConfig {

    @Bean
    public LLMClientFactory llmClientFactory(LLMProperties llmProperties) {
        return new LLMClientFactory(llmProperties);
    }

}
