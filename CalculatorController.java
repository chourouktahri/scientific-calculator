package com.example.scientificcalculator;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
public class CalculatorController {
    private final CalculatorService service;

    public CalculatorController(CalculatorService service) {
        this.service = service;
    }

    @GetMapping("/api/calculate")
    public Map<String, Object> calculate(
            @RequestParam String expression,
            @RequestParam(defaultValue = "DEG") String angleMode) {
        try {
            double result = service.calculate(expression, angleMode);
            if (!Double.isFinite(result)) {
                return Map.of("error", "Invalid calculation");
            }
            return Map.of("result", result);
        } catch (RuntimeException e) {
            return Map.of("error", "Invalid expression or calculation");
        }
    }
}