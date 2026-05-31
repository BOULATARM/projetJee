package com.lias.repository;

import com.lias.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByDestinataireIdAndLueFalse(Long membreId);
    List<Notification> findByDestinataireIdOrderByDateCreationDesc(Long membreId);
}
