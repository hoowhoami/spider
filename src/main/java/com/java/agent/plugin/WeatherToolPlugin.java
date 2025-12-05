package com.java.agent.plugin;

import com.java.agent.core.ToolContext;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * Weather tool plugin - provides weather information for cities
 */
@Slf4j
@Component
public class WeatherToolPlugin extends AbstractToolPlugin {

    @Override
    public String getName() {
        return "getWeather";
    }

    @Override
    public String getDescription() {
        return "Get weather information for a city. Returns current weather conditions and temperature.";
    }

    @Override
    public String getSchema() {
        return """
                {
                  "type": "object",
                  "properties": {
                    "city": {
                      "type": "string",
                      "description": "The name of the city to get weather for"
                    }
                  },
                  "required": ["city"]
                }
                """;
    }

    @Override
    public String execute(ToolContext context) {
        String city = (String) context.getParameters().get("city");

        // Validate input
        if (city == null || city.trim().isEmpty()) {
            throw new IllegalArgumentException("City name cannot be null or empty");
        }

        log.debug("Getting weather for city: {}", city);

        try {
            // Simulate weather data (in production, call real weather API)
            return String.format("Weather in %s: Sunny, 25°C, Humidity: 60%%, Wind: 10 km/h", city.trim());
        } catch (Exception e) {
            log.error("Error getting weather for city: {}", city, e);
            throw new RuntimeException("Failed to retrieve weather data: " + e.getMessage(), e);
        }
    }

    @Override
    public void onLoad() {
        log.info("Weather tool plugin loaded successfully");
    }

    @Override
    public void onUnload() {
        log.info("Weather tool plugin unloaded");
    }
}
