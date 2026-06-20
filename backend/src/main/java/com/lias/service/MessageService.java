package com.lias.service;

import com.lias.dto.response.MessageDTO;
import com.lias.entity.MessageType;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface MessageService {
    MessageDTO sendMessage(Long senderId, String contenu, MessageType type, Long recipientId, Long equipeId, Long evenementId, MultipartFile fichier);
    List<MessageDTO> getGlobalMessages();
    List<MessageDTO> getTeamMessages(Long equipeId);
    List<MessageDTO> getDirectConversation(Long meId, Long otherId);
    List<MessageDTO> getEventMessages(Long evenementId);
    List<Long> getConversationPartnerIds(Long meId);
    void markDirectRead(Long meId, Long otherId);
    long countUnreadDirect(Long meId);
}
