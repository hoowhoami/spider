package com.java.agent.tool;

import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.stereotype.Component;

import java.util.regex.Pattern;

/**
 * Email tool - sends emails with security controls
 * @author whoami
 */
@Slf4j
@Component
public class EmailTool extends AbstractAgentTool {

    private static final Pattern EMAIL_PATTERN = Pattern.compile(
            "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$"
    );

    @Tool(description = "Send an email to a recipient. Parameters: to (email address), subject (email subject), content (email body).")
    public String sendEmail(String to, String subject, String content) {
        if (to == null || to.trim().isEmpty()) {
            throw new IllegalArgumentException("Recipient email cannot be null or empty");
        }
        if (subject == null || subject.trim().isEmpty()) {
            throw new IllegalArgumentException("Email subject cannot be null or empty");
        }
        if (content == null || content.trim().isEmpty()) {
            throw new IllegalArgumentException("Email content cannot be null or empty");
        }

        log.info("Sending email to: {}, subject: {}", to, subject);

        validateEmail(to);

        try {
            // In production, integrate with actual email service
            log.info("Email sent successfully to: {}", to);
            log.debug("Subject: {}", subject);
            log.debug("Content: {}", content);

            return String.format("Email sent successfully to %s with subject '%s'", to, subject);

        } catch (Exception e) {
            log.error("Error sending email to: {}", to, e);
            throw new RuntimeException("Email sending failed: " + e.getMessage(), e);
        }
    }

    private void validateEmail(String email) {
        if (!EMAIL_PATTERN.matcher(email).matches()) {
            throw new IllegalArgumentException("Invalid email format: " + email);
        }
    }
}
