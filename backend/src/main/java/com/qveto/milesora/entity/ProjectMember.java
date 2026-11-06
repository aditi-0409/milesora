package com.qveto.milesora.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;

@Entity
@Table(
    name = "project_members",
    uniqueConstraints = {
        @UniqueConstraint(
            columnNames = {"project_id", "user_id"}
        )
    }
)
public class ProjectMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private AppUser user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProjectMemberRole role = ProjectMemberRole.MEMBER;

    @Column(nullable = false, updatable = false)
    private LocalDateTime joinedAt;

    public ProjectMember() {
    }

    @PrePersist
    protected void onCreate() {
        joinedAt = LocalDateTime.now();

        if (role == null) {
            role = ProjectMemberRole.MEMBER;
        }
    }

    public Long getId() {
        return id;
    }

    public Project getProject() {
        return project;
    }

    public void setProject(Project project) {
        this.project = project;
    }

    public AppUser getUser() {
        return user;
    }

    public void setUser(AppUser user) {
        this.user = user;
    }

    public ProjectMemberRole getRole() {
        return role;
    }

    public void setRole(ProjectMemberRole role) {
        this.role = role;
    }

    public LocalDateTime getJoinedAt() {
        return joinedAt;
    }
}