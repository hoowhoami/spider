package com.java.agent.health;

import com.java.agent.core.ToolRegistry;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AgentHealthIndicator implements HealthIndicator {
    private final ToolRegistry registry;

    @Override
    public Health health() {
        int toolCount = registry.getAllTools().size();
        return toolCount > 0
            ? Health.up().withDetail("tools", toolCount).build()
            : Health.down().withDetail("tools", 0).build();
    }
}
