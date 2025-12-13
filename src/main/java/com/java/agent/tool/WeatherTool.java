package com.java.agent.tool;

import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.stereotype.Component;

/**
 * Weather tool - provides weather information for cities
 * @author whoami
 */
@Slf4j
@Component
public class WeatherTool extends AbstractAgentTool {

    @Tool(description = "Get weather information for a city. Returns current weather conditions and temperature.")
    public String getWeather(String city) {
        if (city == null || city.trim().isEmpty()) {
            throw new IllegalArgumentException("City name cannot be null or empty");
        }

        log.debug("Getting weather for city: {}", city);

        // Simulate weather data (in production, call real weather API)
        return String.format("Weather in %s: Sunny, 25°C, Humidity: 60%%, Wind: 10 km/h", city.trim());
    }
}
