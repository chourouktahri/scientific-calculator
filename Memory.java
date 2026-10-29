 package com.example.scientificcalculator;

public class Memory {

    private double value = 0;

    public void add(double number) {
        value += number;
    }

    public void subtract(double number) {
        value -= number;
    }

    public double recall() {
        return value;
    }

    public void clear() {
        value = 0;
    }
} 

