package com.qveto.milesora.controller;

import java.io.IOException;
import java.nio.file.Path;
import java.util.List;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.qveto.milesora.dto.AttachmentResponse;
import com.qveto.milesora.entity.Attachment;
import com.qveto.milesora.service.AttachmentService;

@RestController
@RequestMapping("/api/tasks/{taskId}/attachments")
public class AttachmentController {

    private final AttachmentService attachmentService;

    public AttachmentController(AttachmentService attachmentService) {
        this.attachmentService = attachmentService;
    }

    // Upload an attachment
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AttachmentResponse> uploadAttachment(
            @PathVariable Long taskId,
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {

        Attachment attachment = attachmentService.uploadAttachment(
                taskId, file, authentication.getName());

        return ResponseEntity.status(201)
                .body(toResponse(attachment));
    }

    // Get all attachments for a task
    @GetMapping
    public ResponseEntity<List<AttachmentResponse>> getAttachments(
            @PathVariable Long taskId,
            Authentication authentication) {

        List<AttachmentResponse> responses =
                attachmentService.getTaskAttachments(
                        taskId, authentication.getName())
                        .stream()
                        .map(this::toResponse)
                        .toList();

        return ResponseEntity.ok(responses);
    }

    // Download an attachment
    @GetMapping("/{attachmentId}/download")
    public ResponseEntity<Resource> downloadAttachment(
            @PathVariable Long taskId,
            @PathVariable Long attachmentId,
            Authentication authentication) throws IOException {

        String username = authentication.getName();

        Attachment attachment = attachmentService.getAttachment(
                taskId, attachmentId, username);

        Path filePath = attachmentService.getAttachmentPath(
                taskId, attachmentId, username);

        Resource resource = new UrlResource(filePath.toUri());

        if (!resource.exists() || !resource.isReadable()) {
            return ResponseEntity.notFound().build();
        }

        MediaType mediaType;

        try {
            mediaType = MediaType.parseMediaType(
                    attachment.getContentType());
        } catch (Exception ex) {
            mediaType = MediaType.APPLICATION_OCTET_STREAM;
        }

        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment()
                                .filename(attachment.getOriginalFileName())
                                .build()
                                .toString())
                .body(resource);
    }

    // Delete an attachment
    @DeleteMapping("/{attachmentId}")
    public ResponseEntity<Void> deleteAttachment(
            @PathVariable Long taskId,
            @PathVariable Long attachmentId,
            Authentication authentication) {

        attachmentService.deleteAttachment(
                taskId, attachmentId, authentication.getName());

        return ResponseEntity.noContent().build();
    }

    // Convert entity into response DTO
    private AttachmentResponse toResponse(Attachment attachment) {

        AttachmentResponse response = new AttachmentResponse();

        response.setId(attachment.getId());
        response.setTaskId(attachment.getTask().getId());
        response.setOriginalFileName(attachment.getOriginalFileName());
        response.setContentType(attachment.getContentType());
        response.setFileSize(attachment.getFileSize());
        response.setUploadedBy(attachment.getUploadedBy().getId());
        response.setUploaderName(attachment.getUploadedBy().getName());
        response.setUploadedAt(attachment.getUploadedAt());

        return response;
    }
}