package com.java.agent.tool;

import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.stereotype.Component;

/**
 * Calculator tool - performs basic arithmetic operations
 *
 * @author whoami
 */
@Slf4j
@Component
public class CalculatorTool extends AbstractAgentTool {

    @Tool(description = "Perform basic arithmetic operations. Supports +, -, *, / and parentheses. Example: '2+2', '(3+5)*2'")
    public String calculate(String expression) {
        if (expression == null || expression.trim().isEmpty()) {
            throw new IllegalArgumentException("Expression cannot be null or empty");
        }

        log.debug("Evaluating expression: {}", expression);

        try {
            double result = eval(expression);
            return String.format("%.2f", result);
        } catch (Exception e) {
            log.error("Error evaluating expression: {}", expression, e);
            throw new IllegalArgumentException("Invalid expression: " + e.getMessage(), e);
        }
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
