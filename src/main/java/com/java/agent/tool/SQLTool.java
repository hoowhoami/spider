package com.java.agent.tool;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;

/**
 * SQL tool - executes SQL queries with security controls
 * @author whoami
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class SQLTool extends AbstractAgentTool {

    private final JdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final Set<String> ALLOWED_TABLES = Set.of(
            "orders", "customers", "products", "spring_ai_chat_memory"
    );

    private static final Pattern DANGEROUS_PATTERN = Pattern.compile(
            "(?i).*(DROP|DELETE|UPDATE|INSERT|TRUNCATE|ALTER|CREATE|GRANT|REVOKE).*"
    );

    @Tool(description = "Execute SQL query and return results in JSON format. Only SELECT queries are allowed. " +
            "Allowed tables: orders, customers, products, spring_ai_chat_memory. " +
            "Example: 'SELECT * FROM orders WHERE amount > 1000 LIMIT 10'")
    public String executeQuery(String sql) {
        if (sql == null || sql.trim().isEmpty()) {
            throw new IllegalArgumentException("SQL cannot be null or empty");
        }

        log.info("Executing SQL query: {}", sql);

        validateSQL(sql);

        try {
            List<Map<String, Object>> results = jdbcTemplate.queryForList(sql);

            if (results.isEmpty()) {
                return "Query executed successfully. No results found.";
            }

            String json = objectMapper.writeValueAsString(results);
            return String.format("Query executed successfully. Found %d rows:\n%s", results.size(), json);

        } catch (Exception e) {
            log.error("Error executing SQL: {}", sql, e);
            throw new RuntimeException("SQL execution failed: " + e.getMessage(), e);
        }
    }

    private void validateSQL(String sql) {
        String upperSQL = sql.toUpperCase().trim();

        if (!upperSQL.startsWith("SELECT")) {
            throw new SecurityException("Only SELECT queries are allowed");
        }

        if (DANGEROUS_PATTERN.matcher(sql).matches()) {
            throw new SecurityException("SQL contains dangerous keywords");
        }

        boolean hasAllowedTable = ALLOWED_TABLES.stream()
                .anyMatch(table -> upperSQL.contains(table.toUpperCase()));

        if (!hasAllowedTable) {
            throw new SecurityException("SQL must query from allowed tables: " + ALLOWED_TABLES);
        }
    }
}
