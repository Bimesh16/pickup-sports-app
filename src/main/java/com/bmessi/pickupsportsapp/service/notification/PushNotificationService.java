package com.bmessi.pickupsportsapp.service.notification;

import com.bmessi.pickupsportsapp.service.push.PushSenderService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * Facade for queuing push notifications via {@link PushSenderService}.
 */
@Service
@RequiredArgsConstructor
public class PushNotificationService {

    private final PushSenderService pushSenderService;

    public void send(String username, String title, String body) {
        send(username, title, body, null);
    }

    public void send(String username, String title, String body, String link) {
        pushSenderService.enqueue(username, title, body, link);
    }
}
