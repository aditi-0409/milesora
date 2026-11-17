package com.qveto.milesora.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.qveto.milesora.dto.NotificationResponse;
import com.qveto.milesora.entity.AppUser;
import com.qveto.milesora.entity.Notification;
import com.qveto.milesora.entity.NotificationType;
import com.qveto.milesora.entity.Task;
import com.qveto.milesora.repository.AppUserRepository;
import com.qveto.milesora.repository.NotificationRepository;
import com.qveto.milesora.repository.TaskRepository;

@Service
@Transactional
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final AppUserRepository appUserRepository;
    private final TaskRepository taskRepository;

    public NotificationService(
            NotificationRepository notificationRepository,
            AppUserRepository appUserRepository,
            TaskRepository taskRepository) {
        this.notificationRepository = notificationRepository;
        this.appUserRepository = appUserRepository;
        this.taskRepository = taskRepository;
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getMyNotifications(String username) {
        AppUser user = getUser(username);

        return notificationRepository
                .findByRecipient_IdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getUnreadNotifications(String username) {
        AppUser user = getUser(username);

        return notificationRepository
                .findByRecipient_IdAndIsReadFalseOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(String username) {
        AppUser user = getUser(username);
        return notificationRepository.countByRecipient_IdAndIsReadFalse(user.getId());
    }

    public NotificationResponse markAsRead(Long notificationId, String username) {
        AppUser user = getUser(username);

        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Notification not found"));

        if (!notification.getRecipient().getId().equals(user.getId())) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Notification not found");
        }

        notification.setRead(true);

        return toResponse(notificationRepository.save(notification));
    }

    public void deleteNotification(Long notificationId, String username) {
        AppUser user = getUser(username);

        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Notification not found"));

        if (!notification.getRecipient().getId().equals(user.getId())) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Notification not found");
        }

        notificationRepository.delete(notification);
    }

    public NotificationResponse createNotification(
            Long recipientId,
            String title,
            String message,
            NotificationType type,
            Long taskId) {

        AppUser recipient = appUserRepository.findById(recipientId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Notification recipient not found"));

        if (title == null || title.isBlank() || title.length() > 150) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Title must contain 1 to 150 characters");
        }

        if (message == null || message.isBlank() || message.length() > 1000) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Message must contain 1 to 1000 characters");
        }

        Notification notification = new Notification();
        notification.setRecipient(recipient);
        notification.setTitle(title.trim());
        notification.setMessage(message.trim());
        notification.setType(type == null ? NotificationType.GENERAL : type);
        notification.setRead(false);

        if (taskId != null) {
            Task task = taskRepository.findById(taskId)
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND, "Task not found"));
            notification.setTask(task);
        }

        return toResponse(notificationRepository.save(notification));
    }

    private AppUser getUser(String username) {
        return appUserRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "User not found"));
    }

    private NotificationResponse toResponse(Notification notification) {
        NotificationResponse response = new NotificationResponse();

        response.setId(notification.getId());
        response.setTitle(notification.getTitle());
        response.setMessage(notification.getMessage());
        response.setType(notification.getType());
        response.setTaskId(
                notification.getTask() == null
                        ? null
                        : notification.getTask().getId());
        response.setRead(notification.isRead());
        response.setCreatedAt(notification.getCreatedAt());

        return response;
    }
}