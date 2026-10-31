package com.taskora.milesora.model;
import jakarta.persistence.*;import java.time.LocalDateTime;
@Entity @Table(name="task_comments") public class CommentEntity {@Id @GeneratedValue(strategy=GenerationType.IDENTITY) public Long id; public Long taskId; @Column(length=5000) public String content; public Long authorId; public String authorName; public LocalDateTime createdAt=LocalDateTime.now(); public CommentEntity(){} }
