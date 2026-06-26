package com.lias.controller;

import com.lias.dto.response.MembreResponseDTO;
import com.lias.dto.response.MessageDTO;
import com.lias.entity.MessageType;
import com.lias.enums.StatutParticipation;
import com.lias.repository.EvenementRepository;
import com.lias.repository.MembreRepository;
import com.lias.repository.ParticipationEvenementRepository;
import com.lias.security.UserPrincipal;
import com.lias.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;
    private final MembreRepository membreRepository;
    private final EvenementRepository evenementRepository;
    private final ParticipationEvenementRepository participationRepository;

    // ── envoi ────────────────────────────────────────────────────────────────

    @PostMapping(consumes = "multipart/form-data")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<MessageDTO> send(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) String contenu,
            @RequestParam MessageType type,
            @RequestParam(required = false) Long recipientId,
            @RequestParam(required = false) Long equipeId,
            @RequestParam(required = false) Long evenementId,
            @RequestPart(required = false) MultipartFile fichier) {

        MessageDTO dto = messageService.sendMessage(
                principal.getMembreId(), contenu, type, recipientId, equipeId, evenementId, fichier);
        return ResponseEntity.ok(dto);
    }

    // ── lecture ──────────────────────────────────────────────────────────────

    @GetMapping("/global")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<MessageDTO>> getGlobal() {
        return ResponseEntity.ok(messageService.getGlobalMessages());
    }

    @GetMapping("/team/{equipeId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<MessageDTO>> getTeam(@PathVariable Long equipeId) {
        return ResponseEntity.ok(messageService.getTeamMessages(equipeId));
    }

    @GetMapping("/direct/{otherId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<MessageDTO>> getDirect(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long otherId) {
        return ResponseEntity.ok(messageService.getDirectConversation(principal.getMembreId(), otherId));
    }

    // liste des partenaires de conversation + leurs infos
    @GetMapping("/conversations")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<MembreResponseDTO>> getConversations(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<Long> ids = messageService.getConversationPartnerIds(principal.getMembreId());
        List<MembreResponseDTO> partners = ids.stream()
                .map(id -> membreRepository.findById(id).orElse(null))
                .filter(m -> m != null)
                .map(m -> MembreResponseDTO.builder()
                        .id(m.getId()).nom(m.getNom()).prenom(m.getPrenom())
                        .email(m.getEmail()).photo(m.getPhoto()).build())
                .toList();
        return ResponseEntity.ok(partners);
    }

    // ── événements ───────────────────────────────────────────────────────────

    // liste des événements auxquels le membre participe (pour la sidebar)
    @GetMapping("/mes-evenements")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Map<String, Object>>> getMesEvenements(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<Map<String, Object>> result = participationRepository
                .findAll().stream()
                .filter(p -> p.getMembre().getId().equals(principal.getMembreId()))
                .map(p -> Map.<String, Object>of(
                        "id", p.getEvenement().getId(),
                        "titre", p.getEvenement().getTitre(),
                        "statut", p.getEvenement().getStatut()))
                .distinct()
                .toList();
        return ResponseEntity.ok(result);
    }

    @GetMapping("/event/{evenementId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<MessageDTO>> getEventMessages(@PathVariable Long evenementId) {
        return ResponseEntity.ok(messageService.getEventMessages(evenementId));
    }

    // marquer messages directs comme lus
    @PutMapping("/direct/{otherId}/read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> markRead(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long otherId) {
        messageService.markDirectRead(principal.getMembreId(), otherId);
        return ResponseEntity.ok().build();
    }

    // nombre de messages directs non lus (total)
    @GetMapping("/unread-count")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Long> unreadCount(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(messageService.countUnreadDirect(principal.getMembreId()));
    }

    // non lus par partenaire de conversation { partnerId: count }
    @GetMapping("/unread-per-partner")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<Long, Long>> unreadPerPartner(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(messageService.countUnreadPerPartner(principal.getMembreId()));
    }
}
