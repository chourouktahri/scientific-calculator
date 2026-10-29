package com.example.scientificcalculator;
public final class ScientificOperations {
    private ScientificOperations() {}

    public static double sin(double value) { return Math.sin(Math.toRadians(value)); }
    public static double cos(double value) { return Math.cos(Math.toRadians(value)); }
    public static double tan(double value) { return Math.tan(Math.toRadians(value)); }

    public static double sqrt(double value) {
        if (value < 0) throw new IllegalArgumentException("Square root of negative number");
        return Math.sqrt(value);
    }
    public static double log(double value) {
        if (value <= 0) throw new IllegalArgumentException("log needs a positive number");
        return Math.log10(value);
    }
    public static double ln(double value) {
        if (value <= 0) throw new IllegalArgumentException("ln needs a positive number");
        return Math.log(value);
    }
}
