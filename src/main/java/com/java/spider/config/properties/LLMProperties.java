package com.java.spider.config.properties;

import com.java.spider.enums.LLMProvider;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.NestedConfigurationProperty;

/**
 * LLM configuration properties
 *
 * @author whoami
 */
@Data
@ConfigurationProperties(prefix = "spider.llm")
public class LLMProperties {

    /**
     * Default LLM provider
     */
    private LLMProvider defaultProvider = LLMProvider.OPENAI;

    /**
     * OpenAI configuration
     */
    @NestedConfigurationProperty
    private OpenAIProperties openai = new OpenAIProperties();

    /**
     * Ollama configuration
     */
    @NestedConfigurationProperty
    private OllamaProperties ollama = new OllamaProperties();

    /**
     * Azure OpenAI configuration
     */
    @NestedConfigurationProperty
    private AzureOpenAIProperties azureOpenai = new AzureOpenAIProperties();

    /**
     * Anthropic configuration
     */
    @NestedConfigurationProperty
    private AnthropicProperties anthropic = new AnthropicProperties();

    /**
     * Gemini configuration
     */
    @NestedConfigurationProperty
    private GeminiProperties gemini = new GeminiProperties();


}
