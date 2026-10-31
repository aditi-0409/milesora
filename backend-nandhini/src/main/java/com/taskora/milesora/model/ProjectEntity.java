package com.taskora.milesora.model;
import jakarta.persistence.*;import java.time.LocalDate;import java.time.LocalDateTime;
@Entity @Table(name="projects") public class ProjectEntity {@Id @GeneratedValue(strategy=GenerationType.IDENTITY) public Long id; @Column(nullable=false) public String name; @Column(length=3000) public String description; public String keyCode; public String status="PLANNING"; public String priority="MEDIUM"; public LocalDate startDate; public LocalDate dueDate; public Long managerId; public LocalDateTime createdAt=LocalDateTime.now(); public ProjectEntity(){} }
