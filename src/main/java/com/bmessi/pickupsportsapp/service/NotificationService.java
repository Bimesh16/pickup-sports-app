package com.bmessi.pickupsportsapp.service;

import com.bmessi.pickupsportsapp.entity.Notification;
import com.bmessi.pickupsportsapp.entity.User;
import com.bmessi.pickupsportsapp.repository.NotificationRepository;
import com.bmessi.pickupsportsapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    public Notification createNotification(String username, String message) {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new RuntimeException("User not found");
        }
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setMessage(message);
        return notificationRepository.save(notification);
    }

    public void createGameNotification(String recipientUsername, String actorUsername, String sport, String location, String action) {
        User recipient = userRepository.findByUsername(recipientUsername);
        if (recipient == null) {
            throw new RuntimeException("Recipient user not found");
        }
        String message = actorUsername + " has " + action + " " + sport + " at " + location;
        Notification notification = new Notification();
        notification.setUser(recipient);
        notification.setMessage(message);
        notificationRepository.save(notification);
        System.out.println("Notification created for " + recipientUsername + ": " + message);
    }

    public List<Notification> getUserNotifications(String username) {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new RuntimeException("User not found");
        }
        return notificationRepository.findByUser(user);
    }

    public Notification markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setRead(true);
        return notificationRepository.save(notification);
    }

    public void deleteNotification(Long notificationId) {
        notificationRepository.deleteById(notificationId);
    }
}