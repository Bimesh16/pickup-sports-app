package com.bmessi.pickupsportsapp.config;

import com.bmessi.pickupsportsapp.service.gameaccess.GameAccessService;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.MessagingException;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.security.Principal;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Enforces that only game members/creator can SEND/SUBSCRIBE to
 * /app/games/{id}/** and /topic/games/{id}/**.
 */
@Component
public class WebSocketDestinationAuthInterceptor implements ChannelInterceptor {

    private static final Pattern GAME_DEST = Pattern.compile("^/(app|topic)/games/(\\d+)(/.*)?$");

    private final GameAccessService accessService;

    public WebSocketDestinationAuthInterceptor(GameAccessService accessService) {
        this.accessService = accessService;
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor acc = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (acc == null || acc.getCommand() == null) return message;

        // Only guard SEND/SUBSCRIBE for game destinations
        if (StompCommand.SEND.equals(acc.getCommand()) || StompCommand.SUBSCRIBE.equals(acc.getCommand())) {
            String dest = acc.getDestination();
            if (dest != null) {
                Matcher m = GAME_DEST.matcher(dest);
                if (m.matches()) {
                    Long gameId = Long.parseLong(m.group(2));
                    String username = extractUsername(acc.getUser());
                    if (username == null || !accessService.canAccessGame(gameId, username)) {
                        throw new MessagingException("Forbidden: not a member of game " + gameId);
                    }
                }
            }
        }
        return message;
    }

    private static String extractUsername(Principal p) {
        if (p == null) return null;
        // UsernamePasswordAuthenticationToken.getName() returns principal name
        // Works for any Authentication implementation that sets name as username (our CONNECT step does).
        if (p instanceof Authentication a) {
            return a.getName();
        }
        return p.getName();
    }
}
