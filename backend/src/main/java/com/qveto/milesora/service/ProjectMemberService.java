package com.qveto.milesora.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.qveto.milesora.entity.AppUser;
import com.qveto.milesora.entity.Project;
import com.qveto.milesora.entity.ProjectMember;
import com.qveto.milesora.entity.ProjectMemberRole;
import com.qveto.milesora.repository.AppUserRepository;
import com.qveto.milesora.repository.ProjectMemberRepository;
import com.qveto.milesora.repository.ProjectRepository;

@Service
@Transactional
public class ProjectMemberService {

    private final ProjectMemberRepository memberRepository;
    private final ProjectRepository projectRepository;
    private final AppUserRepository userRepository;

    public ProjectMemberService(
            ProjectMemberRepository memberRepository,
            ProjectRepository projectRepository,
            AppUserRepository userRepository) {

        this.memberRepository = memberRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
    }

    // Add a member to a project
    public ProjectMember addMember(
            Long projectId,
            Long targetUserId,
            ProjectMemberRole role,
            Long requesterId) {

        Project project = getProject(projectId);

        AppUser requester = getUser(requesterId);

        AppUser targetUser = getUser(targetUserId);

        validateManagerAccess(project, requester);

        if (memberRepository.existsByProject_IdAndUser_Id(
                projectId, targetUserId)) {

            throw new IllegalArgumentException(
                    "User is already a member of this project");
        }

        if (role == null) {
            role = ProjectMemberRole.MEMBER;
        }

        if (role == ProjectMemberRole.OWNER) {
            throw new IllegalArgumentException(
                    "Project ownership cannot be assigned through membership");
        }

        // Only the project creator can assign MANAGER.
        if (role == ProjectMemberRole.MANAGER
                && !project.getCreatedBy().getId().equals(requesterId)) {

            throw new IllegalArgumentException(
                    "Only the project owner can assign MANAGER role");
        }

        ProjectMember member = new ProjectMember();

        member.setProject(project);
        member.setUser(targetUser);
        member.setRole(role);

        return memberRepository.save(member);
    }

    // Get all members of a project
    @Transactional(readOnly = true)
    public List<ProjectMember> getProjectMembers(
            Long projectId, Long requesterId) {

        Project project = getProject(projectId);

        AppUser requester = getUser(requesterId);

        validateMemberAccess(project, requester);

        return memberRepository.findAllByProject_Id(projectId);
    }

    // Remove a member from a project
    public void removeMember(
            Long projectId,
            Long targetUserId,
            Long requesterId) {

        Project project = getProject(projectId);

        AppUser requester = getUser(requesterId);

        validateManagerAccess(project, requester);

        ProjectMember member = memberRepository
                .findByProject_IdAndUser_Id(
                        projectId, targetUserId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Project membership not found"));

        if (member.getRole() == ProjectMemberRole.OWNER) {
            throw new IllegalArgumentException(
                    "Project owner cannot be removed through membership");
        }

        // A manager cannot remove another manager.
        if (member.getRole() == ProjectMemberRole.MANAGER
                && !project.getCreatedBy().getId().equals(requesterId)) {

            throw new IllegalArgumentException(
                    "Only the project owner can remove a manager");
        }

        memberRepository.delete(member);
    }

    // Check whether requester can manage project members
    private void validateManagerAccess(
            Project project, AppUser requester) {

        Long requesterId = requester.getId();

        boolean isOwner =
                project.getCreatedBy().getId().equals(requesterId);

        boolean isManager = memberRepository
                .findByProject_IdAndUser_Id(
                        project.getId(), requesterId)
                .map(member ->
                        member.getRole() == ProjectMemberRole.MANAGER)
                .orElse(false);

        if (!isOwner && !isManager) {
            throw new SecurityException(
                    "Only project owner or manager can manage members");
        }
    }

    // Check whether requester can view project members
    private void validateMemberAccess(
            Project project, AppUser requester) {

        Long requesterId = requester.getId();

        boolean isOwner =
                project.getCreatedBy().getId().equals(requesterId);

        boolean isMember = memberRepository
                .existsByProject_IdAndUser_Id(
                        project.getId(), requesterId);

        if (!isOwner && !isMember) {
            throw new SecurityException(
                    "You do not have access to this project");
        }
    }

    private Project getProject(Long projectId) {

        return projectRepository.findById(projectId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Project not found"));
    }

    private AppUser getUser(Long userId) {

        return userRepository.findById(userId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "User not found"));
    }
}