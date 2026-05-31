package com.lias;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class LiasApplication {
    public static void main(String[] args) {
        SpringApplication.run(LiasApplication.class, args);
    }
}
