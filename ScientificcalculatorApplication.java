package com.example.scientificcalculator;
import java.awt.Desktop;
import java.net.URI;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
@SpringBootApplication
public class ScientificcalculatorApplication {
    public static void main(String[] args) {
        SpringApplication.run(ScientificcalculatorApplication.class, args);
    }
    @EventListener(ApplicationReadyEvent.class)
    public void openBrowser() {
        try {
            if (Desktop.isDesktopSupported()) {
                Desktop.getDesktop().browse(
                    new URI("http://localhost:8081")
                );
            }
        } catch (Exception e) {
            System.out.println("Impossible d'ouvrir le navigateur.");
        }
    }
}