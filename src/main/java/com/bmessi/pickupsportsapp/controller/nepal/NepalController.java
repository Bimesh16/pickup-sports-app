package com.bmessi.pickupsportsapp.controller.nepal;

import com.bmessi.pickupsportsapp.service.nepal.NepalMarketService;
import com.bmessi.pickupsportsapp.service.nepal.NepalPaymentService;
import com.bmessi.pickupsportsapp.entity.nepal.CityHost;
import com.bmessi.pickupsportsapp.repository.nepal.CityHostRepository;
import com.bmessi.pickupsportsapp.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

/**
 * Nepal-specific API controller for futsal, payments, and City Champions program.
 * 
 * <p>This controller provides all the Nepal market-specific endpoints needed for
 * the mobile app to deliver localized experiences, payment processing, and
 * City Champions functionality.</p>
 * 
 * @author Pickup Sports App Team
 * @version 2.0.0
 * @since 2.0.0
 */
@RestController
@RequestMapping("/api/v1/nepal")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Nepal Market", description = "Nepal-specific market features including futsal and City Champions")
public class NepalController {

    private final NepalMarketService nepalMarketService;
    private final NepalPaymentService nepalPaymentService;
    private final CityHostRepository cityHostRepository;
    private final UserRepository userRepository;

    // ==================== Futsal Game Discovery ====================

    @GetMapping("/futsal/nearby")
    @Operation(summary = "Find futsal games near user location", 
               description = "Discover futsal games in Nepal with location-based filtering and time slot preferences")
    public ResponseEntity<List<NepalMarketService.FutsalGameDTO>> findNearbyFutsal(
            @RequestParam @DecimalMin("-90.0") @DecimalMax("90.0") Double latitude,
            @RequestParam @DecimalMin("-180.0") @DecimalMax("180.0") Double longitude,
            @RequestParam(defaultValue = "5.0") @DecimalMin("0.1") @DecimalMax("50.0") Double radiusKm,
            @RequestParam(required = false) String timeSlot) {
        
        List<NepalMarketService.FutsalGameDTO> games = nepalMarketService.findNearbyFutsal(
                latitude, longitude, radiusKm, timeSlot);
        return ResponseEntity.ok(games);
    }

    @GetMapping("/futsal/popular-areas")
    @Operation(summary = "Get popular futsal areas in Kathmandu Valley",
               description = "Returns popular areas for futsal with player density and pricing information")
    public ResponseEntity<List<NepalMarketService.PopularAreaDTO>> getPopularFutsalAreas() {
        List<NepalMarketService.PopularAreaDTO> areas = nepalMarketService.getPopularFutsalAreas();
        return ResponseEntity.ok(areas);
    }

    @GetMapping("/sports/localized")
    @Operation(summary = "Get sports with Nepali translations",
               description = "Returns sports list with English and Nepali names for localized UI")
    public ResponseEntity<List<NepalMarketService.LocalizedSportDTO>> getLocalizedSports() {
        List<NepalMarketService.LocalizedSportDTO> sports = nepalMarketService.getLocalizedSports();
        return ResponseEntity.ok(sports);
    }

    @GetMapping("/time-slots/popular")
    @Operation(summary = "Get popular time slots for sports in Nepal",
               description = "Returns popular booking time slots based on local preferences")
    public ResponseEntity<List<NepalMarketService.PopularTimeSlotDTO>> getPopularTimeSlots(
            @RequestParam(required = false) String area) {
        List<NepalMarketService.PopularTimeSlotDTO> timeSlots = nepalMarketService.getPopularTimeSlots(area);
        return ResponseEntity.ok(timeSlots);
    }

    // ==================== Nepal Payment Integration ====================

    @PostMapping("/payment/esewa/initiate")
    @Operation(summary = "Initiate eSewa payment for game booking",
               description = "Creates eSewa payment intent for Nepal users")
    public ResponseEntity<NepalPaymentService.ESewaPaymentResponse> initiateESewaPayment(
            @Valid @RequestBody ESewaPaymentRequest request) {
        
        NepalPaymentService.ESewaPaymentResponse response = nepalPaymentService.createESewaPayment(
                request.gameId, request.userId, request.amount, request.description);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/payment/khalti/initiate")
    @Operation(summary = "Initiate Khalti payment for game booking",
               description = "Creates Khalti payment intent for Nepal users")
    public ResponseEntity<NepalPaymentService.KhaltiPaymentResponse> initiateKhaltiPayment(
            @Valid @RequestBody KhaltiPaymentRequest request) {
        
        NepalPaymentService.KhaltiPaymentResponse response = nepalPaymentService.createKhaltiPayment(
                request.gameId, request.userId, request.amount, request.description);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/payment/esewa/verify")
    @Operation(summary = "Verify eSewa payment completion",
               description = "Verifies eSewa payment using transaction details")
    public ResponseEntity<NepalPaymentService.PaymentVerificationResponse> verifyESewaPayment(
            @Valid @RequestBody ESewaVerificationRequest request) {
        
        NepalPaymentService.PaymentVerificationResponse response = nepalPaymentService.verifyESewaPayment(
                request.paymentId, request.transactionId, request.amount);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/payment/khalti/verify")
    @Operation(summary = "Verify Khalti payment completion",
               description = "Verifies Khalti payment using token")
    public ResponseEntity<NepalPaymentService.PaymentVerificationResponse> verifyKhaltiPayment(
            @Valid @RequestBody KhaltiVerificationRequest request) {
        
        NepalPaymentService.PaymentVerificationResponse response = nepalPaymentService.verifyKhaltiPayment(
                request.paymentId, request.token);
        return ResponseEntity.ok(response);
    }

    // ==================== City Champions (Hosts) Management ====================

    @PostMapping("/hosts/apply")
    @Operation(summary = "Apply to become a City Champion",
               description = "Submit application to become a local sports organizer (City Champion)")
    public ResponseEntity<HostApplicationResponse> applyAsHost(
            @Valid @RequestBody HostApplicationRequest request) {
        
        // Check if user already has an application
        if (cityHostRepository.existsByUserId(request.userId)) {
            return ResponseEntity.badRequest().body(HostApplicationResponse.builder()
                    .success(false)
                    .message("User already has a City Champion application")
                    .build());
        }
        
        var user = userRepository.findById(request.userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        // Create new host application with existing user reference
        CityHost host = CityHost.builder()
                .user(user)
                .city(request.city)
                .district(request.district)
                .province(request.province)
                .status(CityHost.HostStatus.PENDING_VERIFICATION)
                .notes(buildApplicationNotes(request))
                .build();

        CityHost savedHost = cityHostRepository.save(host);
        
        return ResponseEntity.ok(HostApplicationResponse.builder()
                .success(true)
                .hostId(savedHost.getId())
                .applicationNumber("HOST-" + String.format("%06d", savedHost.getId()))
                .message("Application submitted successfully! We will review within 48 hours.")
                .status(savedHost.getStatus().getDisplayName())
                .submittedAt(savedHost.getCreatedAt())
                .build());
    }

    private String buildApplicationNotes(HostApplicationRequest request) {
        StringBuilder sb = new StringBuilder("Application submitted via API");
        if (request.getExperience() != null && !request.getExperience().isBlank()) {
            sb.append(" | Experience: ").append(request.getExperience());
        }
        if (request.getMotivation() != null && !request.getMotivation().isBlank()) {
            sb.append(" | Motivation: ").append(request.getMotivation());
        }
        return sb.toString();
    }

    @GetMapping("/hosts/nearby")
    @Operation(summary = "Find nearby City Champions",
               description = "Discover local City Champions who can help organize games")
    public ResponseEntity<List<CityHostDTO>> findNearbyHosts(
            @RequestParam @DecimalMin("-90.0") @DecimalMax("90.0") Double latitude,
            @RequestParam @DecimalMin("-180.0") @DecimalMax("180.0") Double longitude,
            @RequestParam(defaultValue = "10.0") @DecimalMin("0.1") @DecimalMax("100.0") Double radiusKm) {
        
        // For now, return mock data based on city
        List<CityHostDTO> hosts = List.of(
            CityHostDTO.builder()
                .hostId(1L)
                .hostName("Ram Kumar")
                .city("Kathmandu")
                .hostLevel("Silver")
                .rating(4.7)
                .totalGames(45)
                .distanceKm(1.2)
                .status("ACTIVE")
                .specialization("Futsal Expert")
                .build(),
            CityHostDTO.builder()
                .hostId(2L)
                .hostName("Sita Sharma")
                .city("Kathmandu")
                .hostLevel("Gold")
                .rating(4.9)
                .totalGames(78)
                .distanceKm(2.1)
                .status("ACTIVE")
                .specialization("Multi-Sport Organizer")
                .build()
        );
        
        return ResponseEntity.ok(hosts);
    }

    @GetMapping("/hosts/{hostId}/profile")
    @Operation(summary = "Get City Champion profile",
               description = "Get detailed profile of a specific City Champion")
    public ResponseEntity<CityHostProfileDTO> getHostProfile(@PathVariable Long hostId) {
        // For now, return mock data
        CityHostProfileDTO profile = CityHostProfileDTO.builder()
                .hostId(hostId)
                .hostName("Ram Kumar")
                .city("Kathmandu")
                .district("Kathmandu")
                .province("Bagmati")
                .hostLevel("Silver")
                .rating(4.7)
                .totalGames(45)
                .totalRevenue(new BigDecimal("13500"))
                .joinedDate(OffsetDateTime.now().minusMonths(3))
                .specializations(List.of("Futsal", "5v5 Games", "Evening Sessions"))
                .achievements(List.of("Top Host of the Month", "100 Games Milestone"))
                .bio("Passionate futsal player and organizer in Kathmandu. Been playing for 5 years and organizing games for 2 years.")
                .contactInfo("Available weekdays 5-9 PM, weekends flexible")
                .build();
        
        return ResponseEntity.ok(profile);
    }

    // ==================== Request/Response DTOs ====================

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class ESewaPaymentRequest {
        @NotNull private Long gameId;
        @NotNull private Long userId;
        @NotNull @DecimalMin("50.0") private BigDecimal amount;
        @NotBlank private String description;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class KhaltiPaymentRequest {
        @NotNull private Long gameId;
        @NotNull private Long userId;
        @NotNull @DecimalMin("50.0") private BigDecimal amount;
        @NotBlank private String description;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class ESewaVerificationRequest {
        @NotBlank private String paymentId;
        @NotBlank private String transactionId;
        @NotNull private BigDecimal amount;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class KhaltiVerificationRequest {
        @NotBlank private String paymentId;
        @NotBlank private String token;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class HostApplicationRequest {
        @NotNull private Long userId;
        @NotBlank private String city;
        @NotBlank private String district;
        @NotBlank private String province;
        private String experience;
        private String motivation;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class HostApplicationResponse {
        private Boolean success;
        private Long hostId;
        private String applicationNumber;
        private String message;
        private String status;
        private OffsetDateTime submittedAt;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class CityHostDTO {
        private Long hostId;
        private String hostName;
        private String city;
        private String hostLevel;
        private Double rating;
        private Integer totalGames;
        private Double distanceKm;
        private String status;
        private String specialization;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class CityHostProfileDTO {
        private Long hostId;
        private String hostName;
        private String city;
        private String district;
        private String province;
        private String hostLevel;
        private Double rating;
        private Integer totalGames;
        private BigDecimal totalRevenue;
        private OffsetDateTime joinedDate;
        private List<String> specializations;
        private List<String> achievements;
        private String bio;
        private String contactInfo;
    }
}
