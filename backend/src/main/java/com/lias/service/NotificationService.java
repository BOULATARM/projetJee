package com.lias.service;

import com.lias.entity.Notification;
import com.lias.enums.TypeNotification;
import java.util.List;

public interface NotificationService {
    void envoyerNotification(Long destinataireId, String message, TypeNotification type);
    List<Notification> getNotificationsNonLues(Long membreId);
    List<Notification> getAllNotifications(Long membreId);
    void marquerCommeLue(Long notificationId);
    void marquerToutesLues(Long membreId);
}
