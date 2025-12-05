package com.java.agent.plugin;

import com.java.agent.core.ToolContext;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * Calculator tool plugin - performs basic arithmetic operations
 */
@Slf4j
@Component
public class CalculatorToolPlugin extends AbstractToolPlugin {

    @Override
    public String getName() {
        return "calculate";
    }

    @Override
    public String getDescription() {
        return "Perform basic arithmetic operations. Supports +, -, *, / and parentheses.";
    }

    @Override
    public String getSchema() {
        return """
                {
                  "type": "object",
                  "properties": {
                    "expression": {
                      "type": "string",
                      "description": "Mathematical expression to evaluate (e.g., '2+2', '10*5', '(3+5)*2')"
                    }
                  },
                  "required": ["expression"]
                }
                """;
    }

    @Override
    public String execute(ToolContext context) {
        String expr = (String) context.getParameters().get("expression");

        // Validate input
        if (expr == null || expr.trim().isEmpty()) {
            throw new IllegalArgumentException("Expression cannot be null or empty");
        }

        log.debug("Evaluating expression: {}", expr);

        try {
            double result = eval(expr);
            return String.format("Result: %.2f", result);
        } catch (NumberFormatException e) {
            log.error("Invalid number format in expression: {}", expr, e);
            throw new IllegalArgumentException("Invalid number format in expression: " + e.getMessage(), e);
        } catch (ArithmeticException e) {
            log.error("Arithmetic error in expression: {}", expr, e);
            throw new ArithmeticException("Arithmetic error: " + e.getMessage());
        } catch (Exception e) {
            log.error("Error evaluating expression: {}", expr, e);
            throw new IllegalArgumentException("Invalid expression: " + e.getMessage(), e);
        }
    }

    @Override
    public void onLoad() {
        log.info("Calculator tool plugin loaded successfully");
    }

    @Override
    public void onUnload() {
        log.info("Calculator tool plugin unloaded");
    }

    private double eval(String expr) {
        return new Object() {
            int pos = -1, ch;

            void nextChar() {
                ch = (++pos < expr.length()) ? expr.charAt(pos) : -1;
            }

            boolean eat(int charToEat) {
                while (ch == ' ') nextChar();
                if (ch == charToEat) {
                    nextChar();
                    return true;
                }
                return false;
            }

            double parse() {
                nextChar();
                return parseExpression();
            }

            double parseExpression() {
                double x = parseTerm();
                for (; ; ) {
                    if (eat('+')) x += parseTerm();
                    else if (eat('-')) x -= parseTerm();
                    else return x;
                }
            }

            double parseTerm() {
                double x = parseFactor();
                for (; ; ) {
                    if (eat('*')) x *= parseFactor();
                    else if (eat('/')) x /= parseFactor();
                    else return x;
                }
            }

            double parseFactor() {
                int startPos = pos;
                if (eat('(')) {
                    double x = parseExpression();
                    eat(')');
                    return x;
                }
                while ((ch >= '0' && ch <= '9') || ch == '.') nextChar();
                return Double.parseDouble(expr.substring(startPos, pos));
            }
        }.parse();
    }
}
