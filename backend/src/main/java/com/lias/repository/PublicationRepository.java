package com.lias.repository;

import com.lias.entity.Publication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PublicationRepository extends JpaRepository<Publication, Long> {
    List<Publication> findByAnnee(Integer annee);
    List<Publication> findByEquipeId(Long equipeId);
    List<Publication> findByAuteurs_MembreId(Long membreId);
    long countByAnnee(Integer annee);
}
