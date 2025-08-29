package com.bmessi.pickupsportsapp.repository;

import com.bmessi.pickupsportsapp.entity.VenueBooking;
import com.bmessi.pickupsportsapp.entity.VenueBooking.BookingStatus;
import com.bmessi.pickupsportsapp.entity.VenueBooking.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for venue booking operations.
 */
@Repository
public interface VenueBookingRepository extends JpaRepository<VenueBooking, Long> {

    /**
     * Find bookings by venue ID.
     */
    List<VenueBooking> findByVenueId(Long venueId);

    /**
     * Find bookings by user who made the booking.
     */
    List<VenueBooking> findByBookedById(Long userId);

    /**
     * Find bookings by status.
     */
    List<VenueBooking> findByStatus(BookingStatus status);

    /**
     * Find bookings by payment status.
     */
    List<VenueBooking> findByPaymentStatus(PaymentStatus paymentStatus);

    /**
     * Find conflicting bookings for a venue in a time range.
     */
    @Query("SELECT vb FROM VenueBooking vb WHERE vb.venue.id = :venueId " +
           "AND vb.status NOT IN (com.bmessi.pickupsportsapp.entity.VenueBooking$BookingStatus.CANCELLED, com.bmessi.pickupsportsapp.entity.VenueBooking$BookingStatus.COMPLETED) " +
           "AND ((vb.startTime < :endTime AND vb.endTime > :startTime) " +
           "OR (vb.startTime >= :startTime AND vb.startTime < :endTime) " +
           "OR (vb.endTime > :startTime AND vb.endTime <= :endTime))")
    List<VenueBooking> findConflictingBookings(
            @Param("venueId") Long venueId,
            @Param("startTime") OffsetDateTime startTime,
            @Param("endTime") OffsetDateTime endTime
    );

    /**
     * Find bookings for a venue in a date range.
     */
    @Query("SELECT vb FROM VenueBooking vb WHERE vb.venue.id = :venueId " +
           "AND vb.startTime >= :startDate " +
           "AND vb.startTime < :endDate " +
           "ORDER BY vb.startTime")
    List<VenueBooking> findByVenueAndDateRange(
            @Param("venueId") Long venueId,
            @Param("startDate") OffsetDateTime startDate,
            @Param("endDate") OffsetDateTime endDate
    );

    /**
     * Find upcoming bookings for a user.
     */
    @Query("SELECT vb FROM VenueBooking vb WHERE vb.bookedBy.id = :userId " +
           "AND vb.startTime > :now " +
           "AND vb.status IN (com.bmessi.pickupsportsapp.entity.VenueBooking$BookingStatus.CONFIRMED, com.bmessi.pickupsportsapp.entity.VenueBooking$BookingStatus.PENDING) " +
           "ORDER BY vb.startTime")
    List<VenueBooking> findUpcomingBookingsByUser(
            @Param("userId") Long userId,
            @Param("now") OffsetDateTime now
    );

    /**
     * Find past bookings for a user.
     */
    @Query("SELECT vb FROM VenueBooking vb WHERE vb.bookedBy.id = :userId " +
           "AND vb.startTime < :now " +
           "ORDER BY vb.startTime DESC")
    List<VenueBooking> findPastBookingsByUser(
            @Param("userId") Long userId,
            @Param("now") OffsetDateTime now
    );

    /**
     * Find bookings that need payment confirmation.
     */
    @Query("SELECT vb FROM VenueBooking vb WHERE vb.status = com.bmessi.pickupsportsapp.entity.VenueBooking$BookingStatus.PENDING " +
           "AND vb.paymentStatus = com.bmessi.pickupsportsapp.entity.VenueBooking$PaymentStatus.PENDING " +
           "AND vb.startTime > :now")
    List<VenueBooking> findPendingPaymentBookings(@Param("now") OffsetDateTime now);

    /**
     * Find bookings that can be cancelled (more than 24 hours before start).
     */
    @Query("SELECT vb FROM VenueBooking vb WHERE vb.status IN (com.bmessi.pickupsportsapp.entity.VenueBooking$BookingStatus.CONFIRMED, com.bmessi.pickupsportsapp.entity.VenueBooking$BookingStatus.PENDING) " +
           "AND vb.startTime > :cancellationDeadline")
    List<VenueBooking> findCancellableBookings(@Param("cancellationDeadline") OffsetDateTime cancellationDeadline);

    /**
     * Count active bookings for a venue in a time range.
     */
    @Query("SELECT COUNT(vb) FROM VenueBooking vb WHERE vb.venue.id = :venueId " +
           "AND vb.status NOT IN (com.bmessi.pickupsportsapp.entity.VenueBooking$BookingStatus.CANCELLED, com.bmessi.pickupsportsapp.entity.VenueBooking$BookingStatus.COMPLETED) " +
           "AND vb.startTime >= :startDate " +
           "AND vb.startTime < :endDate")
    long countActiveBookingsInRange(
            @Param("venueId") Long venueId,
            @Param("startDate") OffsetDateTime startDate,
            @Param("endDate") OffsetDateTime endDate
    );

    /**
     * Find bookings by payment intent ID.
     */
    Optional<VenueBooking> findByPaymentIntentId(String paymentIntentId);
}
