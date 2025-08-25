package com.bmessi.pickupsportsapp.service.push;

import com.bmessi.pickupsportsapp.entity.PushOutbox;
import com.bmessi.pickupsportsapp.entity.User;
import com.bmessi.pickupsportsapp.repository.PushOutboxRepository;
import com.bmessi.pickupsportsapp.repository.UserRepository;
import io.micrometer.core.annotation.Timed;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PushSenderService {

    private final PushOutboxRepository outbox;
    private final UserRepository users;

    @Timed("push.enqueue")
    @Transactional
    public PushOutbox enqueue(String username, String title, String body, String link) {
        User u = users.findOptionalByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("user not found"));
        PushOutbox row = PushOutbox.builder()
                .user(u)
                .title(title == null ? "" : title)
                .body(body == null ? "" : body)
                .link(link)
                .status(PushOutbox.Status.PENDING)
                .build();
        return outbox.save(row);
    }
}
