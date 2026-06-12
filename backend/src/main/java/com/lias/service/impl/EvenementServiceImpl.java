package com.lias.service.impl;

import com.lias.dto.request.EvenementRequestDTO;
import com.lias.dto.response.EvenementResponseDTO;
import com.lias.dto.response.OrganisateurDTO;
import com.lias.dto.response.ParticipationDTO;
import com.lias.entity.Evenement;
import com.lias.entity.Laboratoire;
import com.lias.entity.Membre;
import com.lias.entity.OrganisateurEvenement;
import com.lias.entity.ParticipationEvenement;
import com.lias.enums.StatutEvenement;
import com.lias.enums.StatutMembre;
import com.lias.enums.StatutParticipation;
import com.lias.exception.ResourceNotFoundException;
import com.lias.repository.EvenementRepository;
import com.lias.repository.LaboratoireRepository;
import com.lias.repository.MembreRepository;
import com.lias.repository.ParticipationEvenementRepository;
import com.lias.service.EvenementService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EvenementServiceImpl implements EvenementService {

    private final EvenementRepository evenementRepository;
    private final LaboratoireRepository laboratoireRepository;
    private final MembreRepository membreRepository;
    private final ParticipationEvenementRepository participationRepository;

    @Override
    @Transactional
    public EvenementResponseDTO creerEvenement(EvenementRequestDTO dto) {
        List<Laboratoire> labos = laboratoireRepository.findAll();
        Laboratoire laboratoire = labos.isEmpty() ? null : labos.get(0);

        Evenement evenement = Evenement.builder()
                .titre(dto.getTitre())
                .description(dto.getDescription())
                .type(dto.getType())
                .dateDebut(dto.getDateDebut())
                .dateFin(dto.getDateFin())
                .lieu(dto.getLieu())
                .edition(dto.getEdition())
                .annee(dto.getAnnee() != null ? dto.getAnnee() :
                        dto.getDateDebut() != null ? dto.getDateDebut().getYear() : LocalDateTime.now().getYear())
                .laboratoire(laboratoire)
                .statut(StatutEvenement.PLANIFIE)
                .build();

        return toResponseDTO(evenementRepository.save(evenement));
    }

    @Override
    public List<EvenementResponseDTO> getAllEvenements() {
        return evenementRepository.findAll().stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public EvenementResponseDTO getEvenementById(Long id) {
        Evenement evenement = evenementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Evenement", "id", id));
        if (evenement.getStatut() == StatutEvenement.ANNULE) {
            throw new IllegalStateException("Cet événement a été annulé.");
        }
        return toResponseDTO(evenement);
    }

    @Override
    @Transactional
    public EvenementResponseDTO updateEvenement(Long id, EvenementRequestDTO dto) {
        Evenement evt = evenementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Evenement", "id", id));
        if (dto.getTitre() != null) evt.setTitre(dto.getTitre());
        if (dto.getDescription() != null) evt.setDescription(dto.getDescription());
        if (dto.getType() != null) evt.setType(dto.getType());
        if (dto.getDateDebut() != null) evt.setDateDebut(dto.getDateDebut());
        if (dto.getDateFin() != null) evt.setDateFin(dto.getDateFin());
        if (dto.getLieu() != null) evt.setLieu(dto.getLieu());
        if (dto.getEdition() != null) evt.setEdition(dto.getEdition());
        return toResponseDTO(evenementRepository.save(evt));
    }

    @Override
    public List<EvenementResponseDTO> getEvenementsByAnnee(Integer annee) {
        return evenementRepository.findByAnnee(annee).stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void affecterOrganisateur(Long evenementId, Long membreId, String role) {
        Evenement evenement = evenementRepository.findById(evenementId)
                .orElseThrow(() -> new ResourceNotFoundException("Evenement", "id", evenementId));
        Membre membre = membreRepository.findById(membreId)
                .orElseThrow(() -> new ResourceNotFoundException("Membre", "id", membreId));

        OrganisateurEvenement org = OrganisateurEvenement.builder()
                .evenement(evenement)
                .membre(membre)
                .roleOrganisation(role)
                .build();
        evenement.getOrganisateurs().add(org);
        evenementRepository.save(evenement);

        // L'organisateur devient automatiquement participant confirmé
        if (!participationRepository.existsByEvenementIdAndMembreId(evenementId, membreId)) {
            participationRepository.save(ParticipationEvenement.builder()
                    .evenement(evenement)
                    .membre(membre)
                    .statut(StatutParticipation.CONFIRME)
                    .build());
        }
    }

    @Override
    @Transactional
    public void changerStatut(Long evenementId, StatutEvenement statut) {
        Evenement evenement = evenementRepository.findById(evenementId)
                .orElseThrow(() -> new ResourceNotFoundException("Evenement", "id", evenementId));
        evenement.setStatut(statut);
        evenementRepository.save(evenement);
    }

    @Override
    public List<EvenementResponseDTO> getEvenementsByDateRange(LocalDateTime debut, LocalDateTime fin) {
        return evenementRepository.findByDateDebutBetween(debut, fin).stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void annulerEvenement(Long id) {
        Evenement evenement = evenementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Evenement", "id", id));
        evenement.setStatut(StatutEvenement.ANNULE);
        evenementRepository.save(evenement);
    }

    // ─── Participation ───────────────────────────────────────────────────────

    @Override
    @Transactional
    public ParticipationDTO participer(Long evenementId, Long membreId) {
        Evenement evenement = evenementRepository.findById(evenementId)
                .orElseThrow(() -> new ResourceNotFoundException("Evenement", "id", evenementId));
        Membre membre = membreRepository.findById(membreId)
                .orElseThrow(() -> new ResourceNotFoundException("Membre", "id", membreId));

        StatutMembre statutMembre = membre.getStatut();

        // Retraités et anciens membres : accès interdit
        if (statutMembre == StatutMembre.RETRAITE || statutMembre == StatutMembre.ANCIEN) {
            throw new IllegalStateException("Les membres retraités ou anciens ne peuvent pas participer aux événements.");
        }

        if (participationRepository.existsByEvenementIdAndMembreId(evenementId, membreId)) {
            return toParticipationDTO(
                    participationRepository.findByEvenementIdAndMembreId(evenementId, membreId).get()
            );
        }

        // Permanents : confirmation directe. Associés/Doctorants : en attente
        StatutParticipation statut = (statutMembre == StatutMembre.PERMANENT)
                ? StatutParticipation.CONFIRME
                : StatutParticipation.EN_ATTENTE;

        ParticipationEvenement participation = ParticipationEvenement.builder()
                .evenement(evenement)
                .membre(membre)
                .statut(statut)
                .build();

        return toParticipationDTO(participationRepository.save(participation));
    }

    @Override
    @Transactional
    public void confirmerParticipation(Long evenementId, Long membreId) {
        ParticipationEvenement p = participationRepository
                .findByEvenementIdAndMembreId(evenementId, membreId)
                .orElseThrow(() -> new ResourceNotFoundException("Participation", "membreId", membreId));
        p.setStatut(StatutParticipation.CONFIRME);
        participationRepository.save(p);
    }

    @Override
    @Transactional
    public void refuserParticipation(Long evenementId, Long membreId) {
        ParticipationEvenement p = participationRepository
                .findByEvenementIdAndMembreId(evenementId, membreId)
                .orElseThrow(() -> new ResourceNotFoundException("Participation", "membreId", membreId));
        p.setStatut(StatutParticipation.REFUSE);
        participationRepository.save(p);
    }

    @Override
    public List<ParticipationDTO> getParticipations(Long evenementId) {
        return participationRepository.findByEvenementId(evenementId)
                .stream().map(this::toParticipationDTO).collect(Collectors.toList());
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private EvenementResponseDTO toResponseDTO(Evenement evenement) {
        List<ParticipationDTO> parts = participationRepository.findByEvenementId(evenement.getId())
                .stream().map(this::toParticipationDTO).collect(Collectors.toList());

        return EvenementResponseDTO.builder()
                .id(evenement.getId())
                .titre(evenement.getTitre())
                .description(evenement.getDescription())
                .type(evenement.getType())
                .dateDebut(evenement.getDateDebut())
                .dateFin(evenement.getDateFin())
                .lieu(evenement.getLieu())
                .edition(evenement.getEdition())
                .annee(evenement.getAnnee())
                .statut(evenement.getStatut())
                .nbDocuments(evenement.getDocuments() != null ? evenement.getDocuments().size() : 0)
                .participations(parts)
                .organisateurs(evenement.getOrganisateurs().stream().map(o ->
                        OrganisateurDTO.builder()
                                .id(o.getMembre().getId())
                                .nom(o.getMembre().getNom())
                                .prenom(o.getMembre().getPrenom())
                                .photo(o.getMembre().getPhoto())
                                .roleOrganisation(o.getRoleOrganisation())
                                .build()
                ).collect(Collectors.toList()))
                .build();
    }

    private ParticipationDTO toParticipationDTO(ParticipationEvenement p) {
        return ParticipationDTO.builder()
                .id(p.getId())
                .membreId(p.getMembre().getId())
                .prenom(p.getMembre().getPrenom())
                .nom(p.getMembre().getNom())
                .photo(p.getMembre().getPhoto())
                .statutMembre(p.getMembre().getStatut() != null ? p.getMembre().getStatut().name() : null)
                .statut(p.getStatut())
                .dateInscription(p.getDateInscription())
                .build();
    }
}
