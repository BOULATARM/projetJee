package com.lias.repository;

import com.lias.entity.Message;
import com.lias.entity.MessageType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {

    List<Message> findByTypeOrderByDateEnvoiAsc(MessageType type);

    List<Message> findByTypeAndEquipeIdOrderByDateEnvoiAsc(MessageType type, Long equipeId);

    @Query("""
        SELECT m FROM Message m
        WHERE m.type = 'DIRECT'
          AND ((m.sender.id = :a AND m.recipient.id = :b)
            OR (m.sender.id = :b AND m.recipient.id = :a))
        ORDER BY m.dateEnvoi ASC
        """)
    List<Message> findDirectConversation(@Param("a") Long memberId1, @Param("b") Long memberId2);

    // liste des partenaires de conversation directe
    @Query("""
        SELECT DISTINCT CASE WHEN m.sender.id = :me THEN m.recipient.id ELSE m.sender.id END
        FROM Message m
        WHERE m.type = 'DIRECT'
          AND (m.sender.id = :me OR m.recipient.id = :me)
        """)
    List<Long> findConversationPartnerIds(@Param("me") Long meId);

    long countByRecipientIdAndLueFalseAndType(Long recipientId, MessageType type);
    void deleteByEquipeId(Long equipeId);
}
