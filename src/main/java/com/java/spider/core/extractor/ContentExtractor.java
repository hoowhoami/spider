package com.java.spider.core.extractor;

import com.fasterxml.jackson.core.type.TypeReference;
import com.google.common.collect.Maps;
import com.java.spider.core.domain.PageContent;
import com.java.spider.core.factory.LLMClientFactory;
import com.java.spider.enums.LLMProvider;
import com.java.spider.util.JsonUtils;
import dev.langchain4j.model.chat.ChatModel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

/**
 * Content extractor using LLM
 *
 * @author whoami
 */
@Slf4j
@RequiredArgsConstructor
@Component
public class ContentExtractor {

    private final LLMClientFactory llmClientFactory;

    /**
     * Extract content using LLM with custom prompt
     *
     * @param pageContent page content
     * @param prompt      extraction prompt
     * @return extracted content
     */
    public String extractContent(PageContent pageContent, String prompt) {
        return extractContent(pageContent, prompt, null);
    }

    /**
     * Extract content using specific LLM provider
     *
     * @param pageContent page content
     * @param prompt      extraction prompt
     * @param provider    LLM provider (null for default)
     * @return extracted content
     */
    public String extractContent(PageContent pageContent, String prompt, LLMProvider provider) {
        try {
            ChatModel chatModel = provider != null
                    ? llmClientFactory.createChatModel(provider)
                    : llmClientFactory.createDefaultChatModel();

            String systemPrompt = buildSystemPrompt();
            String userPrompt = buildUserPrompt(pageContent, prompt);

            String fullPrompt = systemPrompt + "\n\n" + userPrompt;

            log.info("Extracting content from {} using {}", pageContent.getUrl(), provider);

            return chatModel.chat(fullPrompt);

        } catch (Exception e) {
            log.error("Failed to extract content", e);
            throw new RuntimeException("Content extraction failed: " + e.getMessage(), e);
        }
    }

    /**
     * Extract structured data using LLM
     *
     * @param pageContent page content
     * @param prompt      extraction prompt
     * @param provider    LLM provider
     * @return structured data as map
     */
    public Map<String, Object> extractStructuredData(PageContent pageContent, String prompt, LLMProvider provider) {
        try {
            ChatModel chatModel = provider != null
                    ? llmClientFactory.createChatModel(provider)
                    : llmClientFactory.createDefaultChatModel();

            String systemPrompt = buildStructuredExtractionPrompt();
            String userPrompt = buildUserPrompt(pageContent, prompt);

            String fullPrompt = systemPrompt + "\n\n" + userPrompt;

            String response = chatModel.chat(fullPrompt);

            // Parse JSON response
            return parseJsonResponse(response);

        } catch (Exception e) {
            log.error("Failed to extract structured data", e);
            return new HashMap<>();
        }
    }

    /**
     * Summarize page content
     *
     * @param pageContent page content
     * @param maxLength   maximum summary length
     * @return summary
     */
    public String summarize(PageContent pageContent, int maxLength) {
        String prompt = String.format(
                "Summarize the following web page content in about %d words. " +
                        "Focus on the main points and key information.",
                maxLength / 5
        );

        return extractContent(pageContent, prompt, null);
    }

    /**
     * Extract specific entities from content
     *
     * @param pageContent page content
     * @param entities    entities to extract (e.g., "names", "dates", "prices")
     * @return extracted entities
     */
    public Map<String, Object> extractEntities(PageContent pageContent, String... entities) {
        String entityList = String.join(", ", entities);
        String prompt = String.format(
                "Extract the following entities from the content: %s. " +
                        "Return the result as a JSON object.",
                entityList
        );

        return extractStructuredData(pageContent, prompt, null);
    }

    /**
     * Build system prompt for content extraction
     */
    private String buildSystemPrompt() {
        return """
                You are an expert web content extractor. Your task is to analyze HTML/text content
                and extract relevant information based on user requirements.
                
                Guidelines:
                1. Focus on the main content, ignore navigation, ads, and boilerplate
                2. Preserve important details and structure
                3. Be accurate and precise
                4. If information is not available, say so clearly
                """;
    }

    /**
     * Build system prompt for structured data extraction
     */
    private String buildStructuredExtractionPrompt() {
        return """
                You are an expert web content extractor. Your task is to analyze HTML/text content
                and extract structured information in JSON format.
                
                Guidelines:
                1. Return ONLY valid JSON, no additional text
                2. Use appropriate data types (strings, numbers, arrays, objects)
                3. If a field is not available, use null
                4. Be consistent with field names
                
                Output format: Valid JSON object only
                """;
    }

    /**
     * Build user prompt with page content
     */
    private String buildUserPrompt(PageContent pageContent, String userPrompt) {
        return String.format("""
                        URL: %s
                        Title: %s
                        
                        Content:
                        %s
                        
                        Task: %s
                        """,
                pageContent.getUrl(),
                pageContent.getTitle() != null ? pageContent.getTitle() : "N/A",
                truncateContent(pageContent.getText(), 10000),
                userPrompt
        );
    }

    /**
     * Truncate content to max length
     */
    private String truncateContent(String content, int maxLength) {
        if (content == null) {
            return "";
        }
        if (content.length() <= maxLength) {
            return content;
        }
        return content.substring(0, maxLength) + "\n... (content truncated)";
    }

    /**
     * Parse JSON response from LLM
     */
    private Map<String, Object> parseJsonResponse(String response) {
        if (response == null || response.isBlank()) {
            log.warn("Empty response received from LLM");
            return Maps.newHashMap();
        }

        try {
            // Remove markdown code blocks if present
            String cleaned = response
                    .replaceAll("```json\\s*", "")
                    .replaceAll("```\\s*", "")
                    .trim();

            // Try to extract JSON from response if it contains other text
            cleaned = extractJsonFromResponse(cleaned);

            if (cleaned == null || cleaned.isBlank()) {
                log.warn("No valid JSON found in response");
                return Maps.newHashMap();
            }

            return JsonUtils.fromJson(cleaned, new TypeReference<>() {
            });
        } catch (Exception e) {
            log.error("Failed to parse JSON response: {}", response, e);
            return Maps.newHashMap();
        }
    }

    /**
     * Extract JSON object or array from response text
     */
    private String extractJsonFromResponse(String text) {
        if (text == null || text.isBlank()) {
            return null;
        }

        // Check if the entire text is valid JSON
        text = text.trim();
        if ((text.startsWith("{") && text.endsWith("}")) ||
            (text.startsWith("[") && text.endsWith("]"))) {
            return text;
        }

        // Try to find JSON object in the text
        int jsonStart = text.indexOf('{');
        int jsonEnd = text.lastIndexOf('}');

        if (jsonStart != -1 && jsonEnd != -1 && jsonEnd > jsonStart) {
            return text.substring(jsonStart, jsonEnd + 1);
        }

        // Try to find JSON array in the text
        jsonStart = text.indexOf('[');
        jsonEnd = text.lastIndexOf(']');

        if (jsonStart != -1 && jsonEnd != -1 && jsonEnd > jsonStart) {
            return text.substring(jsonStart, jsonEnd + 1);
        }

        return text;
    }
}
