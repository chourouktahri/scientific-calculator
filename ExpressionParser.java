package com.example.scientificcalculator;
public class ExpressionParser {
    private String input;
    private int pos;
    private boolean radians;

    public double calculate(String expression, String angleMode) {
        input = expression.replace(" ", "");
        pos = 0;
        radians = "RAD".equalsIgnoreCase(angleMode);

        if (input.isEmpty()) throw new IllegalArgumentException("Empty expression");

        double result = expression();
        if (pos < input.length()) throw new IllegalArgumentException("Invalid expression");
        return result;
    }

    public double calculate(String expression) {
        return calculate(expression, "DEG");
    }

    private double expression() {
        double result = term();
        while (pos < input.length()) {
            char op = input.charAt(pos);
            if (op == '+') {
                pos++;
                result += term();
            } else if (op == '-') {
                pos++;
                result -= term();
            } else break;
        }
        return result;
    }

    private double term() {
        double result = unary();
        while (pos < input.length()) {
            char op = input.charAt(pos);
            if (op == '*') {
                pos++;
                result *= unary();
            } else if (op == '/') {
                pos++;
                double value = unary();
                if (value == 0) throw new IllegalArgumentException("Division by zero");
                result /= value;
            } else break;
        }
        return result;
    }

    private double unary() {
        if (pos < input.length() && input.charAt(pos) == '+') {
            pos++;
            return unary();
        }
        if (pos < input.length() && input.charAt(pos) == '-') {
            pos++;
            return -unary();
        }
        return power();
    }

    private double power() {
        double result = primary();
        if (pos < input.length() && input.charAt(pos) == '^') {
            pos++;
            result = Math.pow(result, unary());
        }
        return result;
    }

    private double primary() {
        if (pos >= input.length()) throw new IllegalArgumentException("Incomplete expression");
        char ch = input.charAt(pos);

        if (ch == '(') {
            pos++;
            double result = expression();
            if (pos >= input.length() || input.charAt(pos) != ')')
                throw new IllegalArgumentException("Missing )");
            pos++;
            return result;
        }
        if (Character.isDigit(ch) || ch == '.') return number();
        if (Character.isLetter(ch)) return function();
        throw new IllegalArgumentException("Invalid character");
    }

    private double number() {
        int start = pos;
        boolean dotSeen = false;
        while (pos < input.length()) {
            char ch = input.charAt(pos);
            if (Character.isDigit(ch)) pos++;
            else if (ch == '.' && !dotSeen) {
                dotSeen = true;
                pos++;
            } else break;
        }
        return Double.parseDouble(input.substring(start, pos));
    }

    private double function() {
        int start = pos;
        while (pos < input.length() && Character.isLetter(input.charAt(pos))) pos++;
        String name = input.substring(start, pos).toLowerCase();

        if (name.equals("pi")) return Math.PI;
        if (name.equals("e")) return Math.E;

        if (pos >= input.length() || input.charAt(pos) != '(')
            throw new IllegalArgumentException("Function needs parentheses");

        pos++;
        double value = expression();
        if (pos >= input.length() || input.charAt(pos) != ')')
            throw new IllegalArgumentException("Missing )");
        pos++;

        switch (name) {
            case "sin": return Math.sin(toRadians(value));
            case "cos": return Math.cos(toRadians(value));
            case "tan": return Math.tan(toRadians(value));
            case "asin": return fromRadians(Math.asin(value));
            case "acos": return fromRadians(Math.acos(value));
            case "atan": return fromRadians(Math.atan(value));
            case "sqrt":
                if (value < 0) throw new IllegalArgumentException("Square root of negative number");
                return Math.sqrt(value);
            case "log":
                if (value <= 0) throw new IllegalArgumentException("log needs a positive number");
                return Math.log10(value);
            case "ln":
                if (value <= 0) throw new IllegalArgumentException("ln needs a positive number");
                return Math.log(value);
            default: throw new IllegalArgumentException("Unknown function: " + name);
        }
    }

    private double toRadians(double value) {
        return radians ? value : Math.toRadians(value);
    }

    private double fromRadians(double value) {
        return radians ? value : Math.toDegrees(value);
    }
}


