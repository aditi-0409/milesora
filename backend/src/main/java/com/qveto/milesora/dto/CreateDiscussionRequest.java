package com.qveto.milesora.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CreateDiscussionRequest {

    @NotBlank(message = "Discussion title is required")
    @Size(max = 200, message = "Title cannot exceed 200 characters")
    private String title;

    @Size(max = 60, message = "Category cannot exceed 60 characters")
    private String category = "General";

    @NotBlank(message = "Discussion content is required")
    @Size(max = 5000, message = "Content cannot exceed 5000 characters")
    private String content;

    public CreateDiscussionRequest() {
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
}