package com.qveto.milesora.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class DashboardController {

    @GetMapping("/")
    public String home() {
        return "Welcome to Team Collaboration System!";
    }

    @GetMapping("/admin/dashboard")
    public String adminDashboard() {
        return "Welcome Admin! You can access all sections.";
    }

    @GetMapping("/manager/dashboard")
    public String managerDashboard() {
        return "Welcome Project Manager!";
    }

    @GetMapping("/employee/dashboard")
    public String employeeDashboard() {
        return "Welcome Employee!";
    }
}

