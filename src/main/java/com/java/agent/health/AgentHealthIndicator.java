package com.java.agent.health;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.health.contributor.Health;
import org.springframework.boot.health.contributor.HealthIndicator;
import org.springframework.stereotype.Component;

/**
 * @author whoami
 */
@RequiredArgsConstructor
@Component
public class AgentHealthIndicator implements HealthIndicator {

    @Override
    public Health health() {
        return Health
                .up()
                .build();
    }

}
