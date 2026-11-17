package com.qveto.milesora.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.qveto.milesora.entity.Notification;

public interface NotificationRepository
        extends JpaRepository<Notification, Long> {

    // Get all notifications for a user
    List<Notification> findByRecipient_IdOrderByCreatedAtDesc(Long recipientId);

    // Get unread notifications for a user
    List<Notification> findByRecipient_IdAndIsReadFalseOrderByCreatedAtDesc(
            Long recipientId);

    // Count unread notifications
    long countByRecipient_IdAndIsReadFalse(Long recipientId);
    
    void deleteAllByTask_Id(Long taskId);
}