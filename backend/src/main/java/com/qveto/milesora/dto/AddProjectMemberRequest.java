package com.qveto.milesora.dto;

import com.qveto.milesora.entity.ProjectMemberRole;

public class AddProjectMemberRequest {

    private Long userId;
    private ProjectMemberRole role;

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public ProjectMemberRole getRole() {
        return role;
    }

    public void setRole(ProjectMemberRole role) {
        this.role = role;
    }
}