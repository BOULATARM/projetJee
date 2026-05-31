package com.lias.repository;

import com.lias.entity.ReponseDiscussion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReponseDiscussionRepository extends JpaRepository<ReponseDiscussion, Long> {
}
