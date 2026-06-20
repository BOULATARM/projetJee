package com.lias.service.impl;

import com.lias.dto.response.MembreResponseDTO;
import com.lias.dto.response.MessageDTO;
import com.lias.entity.*;
import com.lias.repository.*;
import com.lias.service.FileStorageService;
import com.lias.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MessageServiceImpl implements MessageService {

    private final MessageRepository messageRepository;
    private final MembreRepository membreRepository;
    private final EquipeRepository equipeRepository;
    private final EvenementRepository evenementRepository;
    private final FileStorageService fileStorageService;

    @Override
    @Transactional
    public MessageDTO sendMessage(Long senderId, String contenu, MessageType type,
                                   Long recipientId, Long equipeId, Long evenementId, MultipartFile fichier) {
        Membre sender = membreRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Membre introuvable"));

        Message.MessageBuilder builder = Message.builder()
                .sender(sender)
                .contenu(contenu)
                .type(type);

        if (fichier != null && !fichier.isEmpty()) {
            String path = fileStorageService.uploadFile(fichier, "messages");
            builder.fichierUrl(path)
                   .fichierNom(fichier.getOriginalFilename())
                   .fichierType(fichier.getContentType());
        }

        if (type == MessageType.DIRECT && recipientId != null) {
            Membre recipient = membreRepository.findById(recipientId)
                    .orElseThrow(() -> new RuntimeException("Destinataire introuvable"));
            builder.recipient(recipient);
        }

        if (type == MessageType.TEAM && equipeId != null) {
            Equipe equipe = equipeRepository.findById(equipeId)
                    .orElseThrow(() -> new RuntimeException("Équipe introuvable"));
            builder.equipe(equipe);
        }

        if (type == MessageType.EVENT && evenementId != null) {
            Evenement evenement = evenementRepository.findById(evenementId)
                    .orElseThrow(() -> new RuntimeException("Événement introuvable"));
            builder.evenement(evenement);
        }

        Message saved = messageRepository.save(builder.build());
        return toDTO(saved);
    }

    @Override
    public List<MessageDTO> getGlobalMessages() {
        return messageRepository.findByTypeOrderByDateEnvoiAsc(MessageType.GLOBAL)
                .stream().map(this::toDTO).toList();
    }

    @Override
    public List<MessageDTO> getTeamMessages(Long equipeId) {
        return messageRepository.findByTypeAndEquipeIdOrderByDateEnvoiAsc(MessageType.TEAM, equipeId)
                .stream().map(this::toDTO).toList();
    }

    @Override
    public List<MessageDTO> getDirectConversation(Long meId, Long otherId) {
        return messageRepository.findDirectConversation(meId, otherId)
                .stream().map(this::toDTO).toList();
    }

    @Override
    public List<MessageDTO> getEventMessages(Long evenementId) {
        return messageRepository.findByTypeAndEvenementIdOrderByDateEnvoiAsc(MessageType.EVENT, evenementId)
                .stream().map(this::toDTO).toList();
    }

    @Override
    public List<Long> getConversationPartnerIds(Long meId) {
        return messageRepository.findConversationPartnerIds(meId);
    }

    @Override
    @Transactional
    public void markDirectRead(Long meId, Long otherId) {
        messageRepository.findDirectConversation(meId, otherId).stream()
                .filter(m -> m.getRecipient() != null && m.getRecipient().getId().equals(meId) && !m.isLue())
                .forEach(m -> {
                    m.setLue(true);
                    messageRepository.save(m);
                });
    }

    @Override
    public long countUnreadDirect(Long meId) {
        return messageRepository.countByRecipientIdAndLueFalseAndType(meId, MessageType.DIRECT);
    }

    private MessageDTO toDTO(Message m) {
        return MessageDTO.builder()
                .id(m.getId())
                .sender(toMembreDTO(m.getSender()))
                .contenu(m.getContenu())
                .fichierUrl(m.getFichierUrl())
                .fichierNom(m.getFichierNom())
                .fichierType(m.getFichierType())
                .type(m.getType())
                .recipient(m.getRecipient() != null ? toMembreDTO(m.getRecipient()) : null)
                .equipeId(m.getEquipe() != null ? m.getEquipe().getId() : null)
                .equipeNom(m.getEquipe() != null ? m.getEquipe().getNom() : null)
                .evenementId(m.getEvenement() != null ? m.getEvenement().getId() : null)
                .evenementTitre(m.getEvenement() != null ? m.getEvenement().getTitre() : null)
                .dateEnvoi(m.getDateEnvoi())
                .lue(m.isLue())
                .build();
    }

    private MembreResponseDTO toMembreDTO(Membre m) {
        return MembreResponseDTO.builder()
                .id(m.getId())
                .nom(m.getNom())
                .prenom(m.getPrenom())
                .email(m.getEmail())
                .photo(m.getPhoto())
                .build();
    }
}
