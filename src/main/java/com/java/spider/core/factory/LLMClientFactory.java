package com.java.spider.core.factory;

import com.java.spider.config.properties.AnthropicProperties;
import com.java.spider.config.properties.AzureOpenAIProperties;
import com.java.spider.config.properties.GeminiProperties;
import com.java.spider.config.properties.LLMProperties;
import com.java.spider.config.properties.OllamaProperties;
import com.java.spider.config.properties.OpenAIProperties;
import com.java.spider.enums.LLMProvider;
import dev.langchain4j.model.anthropic.AnthropicChatModel;
import dev.langchain4j.model.azure.AzureOpenAiChatModel;
import dev.langchain4j.model.chat.ChatModel;
import dev.langchain4j.model.googleai.GoogleAiGeminiChatModel;
import dev.langchain4j.model.ollama.OllamaChatModel;
import dev.langchain4j.model.openai.OpenAiChatModel;
import org.apache.commons.lang3.StringUtils;

import java.time.Duration;

/**
 * LLM client factory for creating different LLM providers
 *
 * @author whoami
 */
public class LLMClientFactory {

    private final LLMProperties llmProperties;

    public LLMClientFactory(LLMProperties llmProperties) {
        this.llmProperties = llmProperties;
    }

    /**
     * Create chat model based on provider
     *
     * @param provider LLM provider
     * @return chat model
     */
    public ChatModel createChatModel(LLMProvider provider) {
        return switch (provider) {
            case OPENAI -> createOpenAIChatModel();
            case OLLAMA -> createOllamaChatModel();
            case AZURE_OPENAI -> createAzureOpenAIChatModel();
            case ANTHROPIC -> createAnthropicChatModel();
            case GEMINI -> createGeminiChatModel();
        };
    }

    /**
     * Create default chat model
     */
    public ChatModel createDefaultChatModel() {
        return createChatModel(llmProperties.getDefaultProvider());
    }

    /**
     * Create OpenAI chat model
     */
    private ChatModel createOpenAIChatModel() {
        OpenAIProperties config = llmProperties.getOpenai();

        OpenAiChatModel.OpenAiChatModelBuilder builder = OpenAiChatModel.builder()
                .apiKey(config.getApiKey())
                .modelName(config.getModelName())
                .temperature(config.getTemperature())
                .maxTokens(config.getMaxTokens())
                .maxRetries(config.getMaxRetries())
                .timeout(Duration.ofSeconds(config.getTimeout()));

        if (StringUtils.isNotBlank(config.getBaseUrl())) {
            builder.baseUrl(config.getBaseUrl());
        }

        return builder.build();
    }

    /**
     * Create Ollama chat model
     */
    private ChatModel createOllamaChatModel() {
        OllamaProperties config = llmProperties.getOllama();

        return OllamaChatModel.builder()
                .baseUrl(config.getBaseUrl())
                .modelName(config.getModelName())
                .temperature(config.getTemperature())
                .maxRetries(config.getMaxRetries())
                .timeout(Duration.ofSeconds(config.getTimeout()))
                .build();
    }

    /**
     * Create Azure OpenAI chat model
     */
    private ChatModel createAzureOpenAIChatModel() {
        AzureOpenAIProperties config = llmProperties.getAzureOpenai();

        return AzureOpenAiChatModel.builder()
                .apiKey(config.getApiKey())
                .endpoint(config.getBaseUrl())
                .deploymentName(config.getDeploymentName())
                .temperature(config.getTemperature())
                .maxTokens(config.getMaxTokens())
                .maxRetries(config.getMaxRetries())
                .timeout(Duration.ofSeconds(config.getTimeout()))
                .build();
    }

    /**
     * Create Anthropic chat model
     */
    private ChatModel createAnthropicChatModel() {
        AnthropicProperties config = llmProperties.getAnthropic();

        AnthropicChatModel.AnthropicChatModelBuilder builder = AnthropicChatModel.builder()
                .apiKey(config.getApiKey())
                .modelName(config.getModelName())
                .temperature(config.getTemperature())
                .maxTokens(config.getMaxTokens())
                .maxRetries(config.getMaxRetries())
                .timeout(Duration.ofSeconds(config.getTimeout()));

        if (StringUtils.isNotBlank(config.getBaseUrl())) {
            builder.baseUrl(config.getBaseUrl());
        }

        return builder.build();
    }

    /**
     * Create Google Gemini chat model
     */
    private ChatModel createGeminiChatModel() {
        GeminiProperties config = llmProperties.getGemini();

        GoogleAiGeminiChatModel.GoogleAiGeminiChatModelBuilder builder = GoogleAiGeminiChatModel.builder()
                .apiKey(config.getApiKey())
                .modelName(config.getModelName())
                .temperature(config.getTemperature())
                .maxOutputTokens(config.getMaxTokens())
                .maxRetries(config.getMaxRetries())
                .timeout(Duration.ofSeconds(config.getTimeout()));

        if (StringUtils.isNotBlank(config.getBaseUrl())) {
            builder.baseUrl(config.getBaseUrl());
        }

        return builder.build();
    }

}
