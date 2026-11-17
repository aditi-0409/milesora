package com.qveto.milesora.service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.ArrayList;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.apache.tika.Tika;

import com.qveto.milesora.entity.AppUser;
import com.qveto.milesora.entity.Attachment;
import com.qveto.milesora.entity.Project;
import com.qveto.milesora.entity.ProjectMember;
import com.qveto.milesora.entity.ProjectMemberRole;
import com.qveto.milesora.entity.Role;
import com.qveto.milesora.entity.Task;
import com.qveto.milesora.repository.AppUserRepository;
import com.qveto.milesora.repository.AttachmentRepository;
import com.qveto.milesora.repository.ProjectMemberRepository;
import com.qveto.milesora.repository.TaskRepository;

@Service
public class AttachmentService {

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024;
    private static final Tika TIKA = new Tika();

    private static final Map<String, String> ALLOWED_TYPES = Map.of(
            "pdf", "application/pdf",
            "png", "image/png",
            "jpg", "image/jpeg",
            "jpeg", "image/jpeg",
            "doc", "application/msword",
            "docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "xls", "application/vnd.ms-excel",
            "xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "txt", "text/plain",
            "csv", "text/csv"
    );

    private final AttachmentRepository attachmentRepository;
    private final TaskRepository taskRepository;
    private final AppUserRepository appUserRepository;
    private final ProjectMemberRepository projectMemberRepository;

    @Value("${app.file.upload-dir:./milesora-uploads}")
    private String uploadDirectory;

    public AttachmentService(
            AttachmentRepository attachmentRepository,
            TaskRepository taskRepository,
            AppUserRepository appUserRepository,
            ProjectMemberRepository projectMemberRepository) {

        this.attachmentRepository = attachmentRepository;
        this.taskRepository = taskRepository;
        this.appUserRepository = appUserRepository;
        this.projectMemberRepository = projectMemberRepository;
    }

    // Upload an attachment
    @Transactional
    public Attachment uploadAttachment(
            Long taskId, MultipartFile file, String username) {

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Please select a file.");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException(
                    "File size must not exceed 10 MB.");
        }

        AppUser user = getUser(username);
        Task task = getTask(taskId);

        validateUploadAccess(task, user);

        String originalName = Optional.ofNullable(file.getOriginalFilename())
                .orElse("uploaded-file")
                .replace("\\", "/");

        originalName = originalName.substring(
                originalName.lastIndexOf('/') + 1);

        String extension = getExtension(originalName);

        String expectedContentType = ALLOWED_TYPES.get(extension);

        if (expectedContentType == null) {
            throw new IllegalArgumentException(
                    "This file type is not allowed.");
        }

        // Detect the actual file type using Apache Tika.
        String detectedContentType;

        try (InputStream inputStream = file.getInputStream()) {
            detectedContentType = TIKA.detect(inputStream, originalName);
        } catch (IOException ex) {
            throw new IllegalArgumentException(
                    "Could not inspect the uploaded file.", ex);
        }

        // Validate detected content against the permitted extension.
        boolean validType =
                detectedContentType.equalsIgnoreCase(expectedContentType);

        // TXT and CSV files can both be detected as text/plain.
        if ("csv".equals(extension)
                && ("text/plain".equalsIgnoreCase(detectedContentType)
                || "text/csv".equalsIgnoreCase(detectedContentType))) {
            validType = true;
        }

        if (!validType) {
            throw new IllegalArgumentException(
                    "The uploaded file content does not match its extension.");
        }

        String storedFileName = UUID.randomUUID() + "." + extension;

        Path root = Paths.get(uploadDirectory)
                .toAbsolutePath().normalize();

        Path destination = root.resolve(storedFileName).normalize();

        if (!destination.startsWith(root)) {
            throw new SecurityException("Invalid file storage path.");
        }

        try {
            Files.createDirectories(root);

            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, destination);
            }

            // Remove the physical file if the database transaction rolls back.
            TransactionSynchronizationManager.registerSynchronization(
                    new TransactionSynchronization() {

                        @Override
                        public void afterCompletion(int status) {
                            if (status != TransactionSynchronization.STATUS_COMMITTED) {
                                try {
                                    Files.deleteIfExists(destination);
                                } catch (IOException ex) {
                                    System.err.println(
                                            "Could not clean up uploaded file: "
                                                    + destination);
                                }
                            }
                        }
                    });

            Attachment attachment = new Attachment();
            attachment.setOriginalFileName(originalName);
            attachment.setStoredFileName(storedFileName);
            attachment.setContentType(expectedContentType);
            attachment.setFileSize(file.getSize());
            attachment.setTask(task);
            attachment.setUploadedBy(user);

            return attachmentRepository.save(attachment);

        } catch (IOException ex) {
            throw new IllegalArgumentException(
                    "Could not store the uploaded file.", ex);
        }
    }

    // Get all attachments belonging to a task
    @Transactional(readOnly = true)
    public List<Attachment> getTaskAttachments(
            Long taskId, String username) {

        AppUser user = getUser(username);
        Task task = getTask(taskId);

        validateViewAccess(task, user);

        return attachmentRepository
                .findAllByTask_IdOrderByUploadedAtAsc(taskId);
    }

    @Transactional(readOnly = true)
    public Attachment getAttachment(
            Long taskId, Long attachmentId, String username) {

        AppUser user = getUser(username);
        Task task = getTask(taskId);

        validateViewAccess(task, user);

        return attachmentRepository
                .findByIdAndTask_Id(attachmentId, taskId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Attachment not found."));
    }

    // Get the physical file path after authorization
    @Transactional(readOnly = true)
    public Path getAttachmentPath(
            Long taskId, Long attachmentId, String username) {

        AppUser user = getUser(username);
        Task task = getTask(taskId);

        validateViewAccess(task, user);

        Attachment attachment = attachmentRepository
                .findByIdAndTask_Id(attachmentId, taskId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Attachment not found."));

        Path root = Paths.get(uploadDirectory)
                .toAbsolutePath().normalize();

        Path filePath = root.resolve(
                attachment.getStoredFileName()).normalize();

        if (!filePath.startsWith(root) || !Files.isRegularFile(filePath)) {
            throw new IllegalArgumentException(
                    "Stored attachment file was not found.");
        }

        return filePath;
    }

    // Delete an attachment
    @Transactional
    public void deleteAttachment(
            Long taskId, Long attachmentId, String username) {

        AppUser user = getUser(username);
        Task task = getTask(taskId);

        Attachment attachment = attachmentRepository
                .findByIdAndTask_Id(attachmentId, taskId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Attachment not found."));

        validateDeleteAccess(task, attachment, user);

        Path root = Paths.get(uploadDirectory)
                .toAbsolutePath().normalize();

        Path filePath = root.resolve(
                attachment.getStoredFileName()).normalize();

        if (!filePath.startsWith(root)) {
            throw new SecurityException("Invalid file storage path.");
        }

        // Delete the database record within the current transaction.
        attachmentRepository.delete(attachment);

        // Delete the physical file only after the database commits.
        TransactionSynchronizationManager.registerSynchronization(
                new TransactionSynchronization() {

                    @Override
                    public void afterCommit() {
                        try {
                            Files.deleteIfExists(filePath);
                        } catch (IOException ex) {
                            System.err.println(
                                    "Could not delete attachment file: "
                                            + filePath);
                            ex.printStackTrace();
                        }
                    }
                });
    }

    // Delete all attachments belonging to a task.
    @Transactional
    public void deleteAllTaskAttachments(Long taskId) {

        List<Attachment> attachments =
                attachmentRepository
                        .findAllByTask_IdOrderByUploadedAtAsc(taskId);

        Path root = Paths.get(uploadDirectory)
                .toAbsolutePath().normalize();

        List<Path> filesToDelete = new ArrayList<>();

        for (Attachment attachment : attachments) {

            Path filePath = root.resolve(
                    attachment.getStoredFileName()).normalize();

            if (!filePath.startsWith(root)) {
                throw new ResponseStatusException(
                        HttpStatus.INTERNAL_SERVER_ERROR,
                        "Invalid attachment storage path.");
            }

            filesToDelete.add(filePath);
        }

        // Delete database records within the current transaction.
        attachmentRepository.deleteAll(attachments);

        // Delete physical files only after successful commit.
        if (!filesToDelete.isEmpty()) {

            TransactionSynchronizationManager.registerSynchronization(
                    new TransactionSynchronization() {

                        @Override
                        public void afterCommit() {

                            for (Path filePath : filesToDelete) {
                                try {
                                    Files.deleteIfExists(filePath);
                                } catch (IOException ex) {
                                    System.err.println(
                                            "Could not delete attachment file: "
                                                    + filePath);
                                    ex.printStackTrace();
                                }
                            }
                        }
                    });
        }
    }

    // Get authenticated user
    private AppUser getUser(String username) {
        return appUserRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException(
                        "User not found."));
    }

    // Get task
    private Task getTask(Long taskId) {
        return taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Task not found."));
    }

    // Extract file extension
    private String getExtension(String fileName) {
        int dotIndex = fileName.lastIndexOf('.');

        if (dotIndex < 0 || dotIndex == fileName.length() - 1) {
            throw new IllegalArgumentException(
                    "File must have a valid extension.");
        }

        return fileName.substring(dotIndex + 1).toLowerCase();
    }

    // Check project membership and role
    private ProjectMember getMembership(Task task, AppUser user) {

        return projectMemberRepository
                .findByProject_IdAndUser_Id(
                        task.getProject().getId(), user.getId())
                .orElseThrow(() -> new SecurityException(
                        "You are not a member of this project."));
    }

    // Check whether user is Admin
    private boolean isAdmin(AppUser user) {
        return user.getRole() == Role.ADMIN;
    }

    // Check project ownership
    private boolean isProjectOwner(Task task, AppUser user) {
        Project project = task.getProject();

        return project.getCreatedBy() != null
                && project.getCreatedBy().getId().equals(user.getId());
    }

    // View permission: Admin, owner and all project members
    private void validateViewAccess(Task task, AppUser user) {

        if (isAdmin(user) || isProjectOwner(task, user)) {
            return;
        }

        getMembership(task, user);
    }

    // Upload permission: Admin, owner and non-viewer members
    private void validateUploadAccess(Task task, AppUser user) {

        if (isAdmin(user) || isProjectOwner(task, user)) {
            return;
        }

        ProjectMember membership = getMembership(task, user);

        if (membership.getRole() == ProjectMemberRole.VIEWER) {
            throw new SecurityException(
                    "Viewers cannot upload attachments.");
        }
    }

    // Delete permission: Admin, owner, project manager or uploader
    private void validateDeleteAccess(
            Task task, Attachment attachment, AppUser user) {

        if (isAdmin(user) || isProjectOwner(task, user)) {
            return;
        }

        ProjectMember membership = getMembership(task, user);

        if (membership.getRole() == ProjectMemberRole.OWNER
                || membership.getRole() == ProjectMemberRole.MANAGER) {
            return;
        }

        if (membership.getRole() != ProjectMemberRole.VIEWER
                && attachment.getUploadedBy().getId().equals(user.getId())) {
            return;
        }

        throw new SecurityException(
                "You are not authorized to delete this attachment.");
    }
}