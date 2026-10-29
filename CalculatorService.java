package com.example.scientificcalculator;
import org.springframework.stereotype.Service;

@Service
public class CalculatorService {
    private final ExpressionParser parser = new ExpressionParser();

    public double calculate(String expression, String angleMode) {
        return parser.calculate(expression, angleMode);
    }

    public double calculate(String expression) {
        return calculate(expression, "DEG");
    }
}
