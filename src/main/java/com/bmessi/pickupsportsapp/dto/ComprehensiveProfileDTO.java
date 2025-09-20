package com.bmessi.pickupsportsapp.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.OffsetDateTime;

/**
 * DTO for comprehensive user profile data.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComprehensiveProfileDTO {

    private Long id;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private LocalDate dateOfBirth;
    private String phoneNumber;
    private String profilePictureUrl;
    private String bio;
    private String location;
    private String timezone;
    private OffsetDateTime createdAt;
    private OffsetDateTime lastLoginAt;
    private Boolean isActive;
    private Boolean isVerified;
    private String preferredSports;
    private String skillLevel;
    private String emergencyContact;
    private String medicalInfo;
    private Boolean publicProfile;
    private Boolean emailNotifications;
    private Boolean pushNotifications;
    private Boolean smsNotifications;
}
