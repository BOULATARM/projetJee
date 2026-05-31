package com.lias.repository;

import com.lias.entity.Discussion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DiscussionRepository extends JpaRepository<Discussion, Long> {
    List<Discussion> findByEquipeId(Long equipeId);
    List<Discussion> findByEvenementId(Long evenementId);
}
