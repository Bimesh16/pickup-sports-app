package com.bmessi.pickupsportsapp.service;

import com.bmessi.pickupsportsapp.entity.ChatConversation;
import com.bmessi.pickupsportsapp.entity.ChatMessage;
import com.bmessi.pickupsportsapp.entity.ChatParticipant;
import com.bmessi.pickupsportsapp.entity.User;
import com.bmessi.pickupsportsapp.repository.ChatConversationRepository;
import com.bmessi.pickupsportsapp.repository.ChatMessageRepository;
import com.bmessi.pickupsportsapp.repository.ChatParticipantRepository;
import com.bmessi.pickupsportsapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ChatService {

    @Autowired
    private ChatConversationRepository conversationRepository;

    @Autowired
    private ChatMessageRepository messageRepository;

    @Autowired
    private ChatParticipantRepository participantRepository;

    @Autowired
    private UserRepository userRepository;

    public List<ConversationSummary> getConversations(String username) {
        Page<ChatConversation> conversations = conversationRepository.findByParticipantUsername(
            username, PageRequest.of(0, 50)
        );
        
        return conversations.getContent().stream()
            .map(this::convertToConversationSummary)
            .collect(Collectors.toList());
    }

    public List<MessageSummary> getMessages(Long conversationId, int page, int size) {
        Page<ChatMessage> messages = messageRepository.findByConversationIdOrderByCreatedAtDesc(
            conversationId, PageRequest.of(page, size)
        );
        
        return messages.getContent().stream()
            .map(this::convertToMessageSummary)
            .collect(Collectors.toList());
    }

    public MessageSummary sendMessage(Long conversationId, String senderUsername, String content, String messageType) {
        ChatConversation conversation = conversationRepository.findById(conversationId)
            .orElseThrow(() -> new RuntimeException("Conversation not found"));
        
        User sender = userRepository.findByUsername(senderUsername);
        if (sender == null) {
            throw new RuntimeException("User not found");
        }
        
        ChatMessage message = ChatMessage.builder()
            .conversation(conversation)
            .sender(sender)
            .content(content)
            .type(ChatMessage.MessageType.valueOf(messageType.toUpperCase()))
            .build();
        
        ChatMessage savedMessage = messageRepository.save(message);
        
        // Update conversation timestamp
        conversation.setUpdatedAt(LocalDateTime.now());
        conversationRepository.save(conversation);
        
        return convertToMessageSummary(savedMessage);
    }

    public ConversationSummary createConversation(String creatorUsername, List<String> participantUsernames, String title, String type) {
        User creator = userRepository.findByUsername(creatorUsername);
        if (creator == null) {
            throw new RuntimeException("Creator not found");
        }
        
        ChatConversation conversation = ChatConversation.builder()
            .title(title)
            .type(ChatConversation.ConversationType.valueOf(type.toUpperCase()))
            .createdBy(creator)
            .build();
        
        ChatConversation savedConversation = conversationRepository.save(conversation);
        
        // Add participants
        for (String username : participantUsernames) {
            User user = userRepository.findByUsername(username);
            if (user != null) {
                ChatParticipant participant = ChatParticipant.builder()
                    .conversation(savedConversation)
                    .user(user)
                    .build();
                participantRepository.save(participant);
            }
        }
        
        return convertToConversationSummary(savedConversation);
    }

    public void markAsRead(Long conversationId, String username) {
        ChatParticipant participant = participantRepository.findByConversationIdAndUsername(conversationId, username)
            .orElseThrow(() -> new RuntimeException("Participant not found"));
        
        participant.setLastReadAt(LocalDateTime.now());
        participantRepository.save(participant);
    }

    private ConversationSummary convertToConversationSummary(ChatConversation conversation) {
        // Get last message
        List<ChatMessage> lastMessages = messageRepository.findByConversationIdOrderByCreatedAtDesc(
            conversation.getId(), PageRequest.of(0, 1)
        ).getContent();
        
        String lastMessage = lastMessages.isEmpty() ? "" : lastMessages.get(0).getContent();
        LocalDateTime lastMessageTime = lastMessages.isEmpty() ? conversation.getCreatedAt() : lastMessages.get(0).getCreatedAt();
        
        return ConversationSummary.builder()
            .id(conversation.getId())
            .title(conversation.getTitle())
            .type(conversation.getType().toString())
            .lastMessage(lastMessage)
            .lastMessageTime(lastMessageTime.toString())
            .participantCount(conversation.getParticipants().size())
            .build();
    }

    private MessageSummary convertToMessageSummary(ChatMessage message) {
        return MessageSummary.builder()
            .id(message.getId())
            .content(message.getContent())
            .type(message.getType().toString())
            .senderUsername(message.getSender().getUsername())
            .senderName(message.getSender().getFirstName() + " " + message.getSender().getLastName())
            .createdAt(message.getCreatedAt().toString())
            .isEdited(message.isEdited())
            .build();
    }

    // DTOs
    @lombok.Data
    @lombok.Builder
    public static class ConversationSummary {
        private Long id;
        private String title;
        private String type;
        private String lastMessage;
        private String lastMessageTime;
        private int participantCount;
    }

    @lombok.Data
    @lombok.Builder
    public static class MessageSummary {
        private Long id;
        private String content;
        private String type;
        private String senderUsername;
        private String senderName;
        private String createdAt;
        private boolean isEdited;
    }
}
