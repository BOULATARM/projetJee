package com.lias.service.impl;

import com.lias.entity.Notification;
import com.lias.enums.TypeNotification;
import com.lias.repository.NotificationRepository;
import com.lias.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;

    @Override
    @Transactional
    public void envoyerNotification(Long destinataireId, String message, TypeNotification type) {
        Notification notification = Notification.builder()
                .destinataire(com.lias.entity.Membre.builder().id(destinataireId).build())
                .message(message)
                .type(type)
                .lue(false)
                .dateCreation(LocalDateTime.now())
                .build();
        notificationRepository.save(notification);
    }

    @Override
    public List<Notification> getNotificationsNonLues(Long membreId) {
        return notificationRepository.findByDestinataireIdAndLueFalse(membreId);
    }

    @Override
    public List<Notification> getAllNotifications(Long membreId) {
        return notificationRepository.findByDestinataireIdOrderByDateCreationDesc(membreId);
    }

    @Override
    @Transactional
    public void marquerCommeLue(Long notificationId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            n.setLue(true);
            notificationRepository.save(n);
        });
    }

    @Override
    @Transactional
    public void marquerToutesLues(Long membreId) {
        List<Notification> nonLues = notificationRepository.findByDestinataireIdAndLueFalse(membreId);
        nonLues.forEach(n -> n.setLue(true));
        notificationRepository.saveAll(nonLues);
    }
}
