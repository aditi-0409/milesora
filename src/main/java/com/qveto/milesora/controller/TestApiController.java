package com.qveto.milesora.controller;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class TestApiController {

    @GetMapping("/test")
    public Map<String, String> testConnection() {
        return Map.of(
            "status", "success",
            "message", "React connected to Milesora backend!"
        );
    }
}