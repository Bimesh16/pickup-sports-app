package com.bmessi.pickupsportsapp.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import com.bmessi.pickupsportsapp.entity.chat.ChatMessage;

import java.time.Instant;

@Entity
@Table(name = "chat_read_receipts",
        uniqueConstraints = @UniqueConstraint(name = "uk_receipt_msg_reader",
                columnNames = {"message_id", "reader"}),
        indexes = {
                @Index(name = "idx_receipt_msg", columnList = "message_id"),
                @Index(name = "idx_receipt_reader", columnList = "reader")
        })
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ChatReadReceipt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "message_id", nullable = false)
    private ChatMessage message;

    @Column(nullable = false, length = 100)
    private String reader;

    @CreationTimestamp
    @Column(name = "read_at", nullable = false, updatable = false)
    private Instant readAt;
}
