package com.taskora.milesora.model;
import jakarta.persistence.*;import java.time.LocalDate;import java.time.LocalDateTime;
@Entity @Table(name="time_entries") public class TimeEntryEntity {@Id @GeneratedValue(strategy=GenerationType.IDENTITY) public Long id; public Long taskId; public Long userId; public Double hours; public String description; public LocalDate date; public LocalDateTime createdAt=LocalDateTime.now(); public TimeEntryEntity(){} }
