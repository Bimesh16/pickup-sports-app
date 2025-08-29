package com.bmessi.pickupsportsapp.service.payment;

import java.time.OffsetDateTime;
import java.util.UUID;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import com.bmessi.pickupsportsapp.service.game.HoldService;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final JdbcTemplate jdbc;
    private final HoldService holdService;

    /**
     * Creates a new payment intent for the given hold and persists the identifier.
     */
    public String createIntentForHold(Long gameId, Long holdId, Long userId) {
        String intentId = "pi_" + UUID.randomUUID();
        jdbc.update("UPDATE game_hold SET payment_intent_id = ? WHERE id = ?", intentId, holdId);
        return intentId;
    }

    /**
     * Creates a new payment intent for venue booking and persists the identifier.
     */
    public String createIntentForVenueBooking(Long bookingId, Long venueId, Long userId) {
        String intentId = "pi_" + UUID.randomUUID();
        jdbc.update("UPDATE venue_bookings SET payment_intent_id = ? WHERE id = ?", intentId, bookingId);
        return intentId;
    }

    /**
     * Confirms a payment intent and moves the user into the game participants.
     */
    public void confirmPayment(String paymentIntentId) {
        HoldRow hold = jdbc.query(
                "SELECT id, game_id, user_id FROM game_hold WHERE payment_intent_id = ?",
                ps -> ps.setString(1, paymentIntentId),
                (rs, rn) -> new HoldRow(rs.getLong("id"), rs.getLong("game_id"), rs.getLong("user_id"))
        ).stream().findFirst().orElse(null);
        if (hold == null) return;
        holdService.confirmHold(hold.gameId(), hold.id(), hold.userId());
    }

    /**
     * Refunds a payment intent. If the hold still exists it is removed; otherwise
     * the participant entry is deleted.
     */
    public void refundPayment(String paymentIntentId) {
        int deletedHold = jdbc.update("DELETE FROM game_hold WHERE payment_intent_id = ?", paymentIntentId);
        if (deletedHold > 0) {
            return;
        }
        GameUser gu = jdbc.query(
                "SELECT game_id, user_id FROM game_participants WHERE payment_intent_id = ?",
                ps -> ps.setString(1, paymentIntentId),
                (rs, rn) -> new GameUser(rs.getLong("game_id"), rs.getLong("user_id"))
        ).stream().findFirst().orElse(null);
        if (gu != null) {
            jdbc.update("DELETE FROM game_participants WHERE game_id = ? AND user_id = ?", gu.gameId(), gu.userId());
        }
    }

    /**
     * Attempt to refund a user's payment if the game has not yet reached its RSVP cutoff.
     *
     * @return true when a refund was attempted
     */
    public boolean refundIfPreCutoff(Long gameId, Long userId) {
        OffsetDateTime cutoff = jdbc.query(
                "SELECT rsvp_cutoff FROM game WHERE id = ?",
                ps -> ps.setLong(1, gameId),
                (rs, rn) -> rs.getObject(1, OffsetDateTime.class)
        ).stream().findFirst().orElse(null);
        if (cutoff != null && OffsetDateTime.now().isBefore(cutoff)) {
            String intentId = jdbc.query(
                    "SELECT payment_intent_id FROM game_participants WHERE game_id = ? AND user_id = ?",
                    ps -> {
                        ps.setLong(1, gameId);
                        ps.setLong(2, userId);
                    },
                    (rs, rn) -> rs.getString(1)
            ).stream().findFirst().orElse(null);
            if (intentId != null) {
                // In a real implementation this would call the payment provider's refund API.
                return true;
            }
        }
        return false;
    }

    private record HoldRow(Long id, Long gameId, Long userId) {}
    private record GameUser(Long gameId, Long userId) {}
}

