package com.example.voting;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication // Enables auto-configuration, component scanning, etc.
public class VotingBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(VotingBackendApplication.class, args);
    }

}