package com.taskora.milesora.model;
import jakarta.persistence.*;import java.time.LocalDateTime;
@Entity @Table(name="discussions") public class DiscussionEntity {@Id @GeneratedValue(strategy=GenerationType.IDENTITY) public Long id; public String title; public String category="General"; @Column(length=5000) public String content; public Long authorId; public String authorName; public LocalDateTime createdAt=LocalDateTime.now(); public boolean pinned=false; public DiscussionEntity(){} }
