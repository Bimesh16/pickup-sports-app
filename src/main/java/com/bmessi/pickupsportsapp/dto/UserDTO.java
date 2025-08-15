package com.bmessi.pickupsportsapp.dto;

import lombok.Data;

@Data
public class UserDTO {
    private Long id;
    private String username;
    private String preferredSport;
    private String location;

    public UserDTO(Long id, String username, String preferredSport, String location) {
        this.id = id;
        this.username = username;
        this.preferredSport = preferredSport;
        this.location = location;
    }
}