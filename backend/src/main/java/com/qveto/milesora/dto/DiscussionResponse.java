package com.qveto.milesora.dto;

import java.time.LocalDateTime;

public class DiscussionResponse {

    private Long id;
    private String title;
    private String category;
    private String content;
    private Long authorId;
    private String authorName;
    private LocalDateTime createdAt;
    private long repliesCount;
    private boolean pinned;

    public DiscussionResponse() {
    }

    public DiscussionResponse(
            Long id,
            String title,
            String category,
            String content,
            Long authorId,
            String authorName,
            LocalDateTime createdAt,
            long repliesCount,
            boolean pinned) {

        this.id = id;
        this.title = title;
        this.category = category;
        this.content = content;
        this.authorId = authorId;
        this.authorName = authorName;
        this.createdAt = createdAt;
        this.repliesCount = repliesCount;
        this.pinned = pinned;
    }

    // Nested author object expected by the React frontend
    public AuthorResponse getAuthor() {
        return new AuthorResponse(authorId, authorName);
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public Long getAuthorId() {
        return authorId;
    }

    public void setAuthorId(Long authorId) {
        this.authorId = authorId;
    }

    public String getAuthorName() {
        return authorName;
    }

    public void setAuthorName(String authorName) {
        this.authorName = authorName;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public long getRepliesCount() {
        return repliesCount;
    }

    public void setRepliesCount(long repliesCount) {
        this.repliesCount = repliesCount;
    }

    public boolean isPinned() {
        return pinned;
    }

    public void setPinned(boolean pinned) {
        this.pinned = pinned;
    }

    // Nested author response
    public static class AuthorResponse {

        private Long id;
        private String name;

        public AuthorResponse(Long id, String name) {
            this.id = id;
            this.name = name;
        }

        public Long getId() {
            return id;
        }

        public String getName() {
            return name;
        }
    }
}