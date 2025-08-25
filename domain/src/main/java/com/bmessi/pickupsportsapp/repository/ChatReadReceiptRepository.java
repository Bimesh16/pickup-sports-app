package com.bmessi.pickupsportsapp.repository;

import com.bmessi.pickupsportsapp.entity.ChatReadReceipt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ChatReadReceiptRepository extends JpaRepository<ChatReadReceipt, Long> {
    boolean existsByMessage_IdAndReader(Long messageId, String reader);
    long countByMessage_Id(Long messageId);

    @Query("select r.reader from ChatReadReceipt r where r.message.id = :messageId")
    List<String> findReaders(@Param("messageId") Long messageId);
}
