package com.taskora.milesora.model;
import jakarta.persistence.*;import java.time.LocalDateTime;
@Entity @Table(name="notifications") public class NotificationEntity {@Id @GeneratedValue(strategy=GenerationType.IDENTITY) public Long id; public Long userId; public String title; @Column(length=2000) public String message; public String type="INFO"; public boolean readFlag=false; public LocalDateTime createdAt=LocalDateTime.now(); public NotificationEntity(){} }
