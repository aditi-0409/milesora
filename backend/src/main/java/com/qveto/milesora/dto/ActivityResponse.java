package com.qveto.milesora.dto;

import java.time.LocalDateTime;

public class ActivityResponse {

    private Long id;
    private ActivityUserResponse user;
    private String detail;
    private String target;
    private LocalDateTime timestamp;

    public ActivityResponse() {
    }

    public ActivityResponse(
            Long id,
            String userName,
            String detail,
            String target,
            LocalDateTime timestamp) {

        this.id = id;
        this.user = new ActivityUserResponse(userName);
        this.detail = detail;
        this.target = target;
        this.timestamp = timestamp;
    }

    public Long getId() {
        return id;
    }

    public ActivityUserResponse getUser() {
        return user;
    }

    public void setUser(ActivityUserResponse user) {
        this.user = user;
    }

    public String getDetail() {
        return detail;
    }

    public void setDetail(String detail) {
        this.detail = detail;
    }

    public String getTarget() {
        return target;
    }

    public void setTarget(String target) {
        this.target = target;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public static class ActivityUserResponse {

        private String name;

        public ActivityUserResponse() {
        }

        public ActivityUserResponse(String name) {
            this.name = name;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }
    }
}