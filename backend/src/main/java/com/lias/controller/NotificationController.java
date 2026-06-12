package com.lias.controller;

import com.lias.entity.Notification;
import com.lias.security.UserPrincipal;
import com.lias.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<Notification>> getAllNotifications(@AuthenticationPrincipal UserPrincipal user) {
        return ResponseEntity.ok(notificationService.getAllNotifications(user.getMembreId()));
    }

    @GetMapping("/non-lues")
    public ResponseEntity<List<Notification>> getNonLues(@AuthenticationPrincipal UserPrincipal user) {
        return ResponseEntity.ok(notificationService.getNotificationsNonLues(user.getMembreId()));
    }

    @PutMapping("/{id}/lue")
    public ResponseEntity<Void> marquerLue(@PathVariable Long id) {
        notificationService.marquerCommeLue(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/marquer-toutes-lues")
    public ResponseEntity<Void> marquerToutesLues(@AuthenticationPrincipal UserPrincipal user) {
        notificationService.marquerToutesLues(user.getMembreId());
        return ResponseEntity.ok().build();
    }

    // Alias utilisé par le Header frontend
    @PutMapping("/tout-lire")
    public ResponseEntity<Void> toutLire(@AuthenticationPrincipal UserPrincipal user) {
        notificationService.marquerToutesLues(user.getMembreId());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/non-lues/count")
    public ResponseEntity<Map<String, Long>> countNonLues(@AuthenticationPrincipal UserPrincipal user) {
        long count = notificationService.getNotificationsNonLues(user.getMembreId()).size();
        return ResponseEntity.ok(Map.of("count", count));
    }
}
