package com.bmessi.pickupsportsapp.mapper;

import com.bmessi.pickupsportsapp.dto.GameDetailsDTO;
import com.bmessi.pickupsportsapp.dto.GameSummaryDTO;
import com.bmessi.pickupsportsapp.dto.NotificationDTO;
import com.bmessi.pickupsportsapp.dto.UserDTO;
import com.bmessi.pickupsportsapp.entity.Game;
import com.bmessi.pickupsportsapp.entity.Notification;
import com.bmessi.pickupsportsapp.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;
import java.util.Set;

@Mapper(componentModel = "spring")
public interface ApiMapper {

    // User
    UserDTO toUserDTO(User user);
    List<UserDTO> toUserDTOs(List<User> users);
    List<UserDTO> toUserDTOs(Set<User> users);

    // Game
    GameSummaryDTO toGameSummaryDTO(Game game);

    @Mapping(target = "participants", source = "participants") // Set<User> -> List<UserDTO> via List method
    GameDetailsDTO toGameDetailsDTO(Game game);

    // Notification
    NotificationDTO toNotificationDTO(Notification n);
    List<NotificationDTO> toNotificationDTOs(List<Notification> list);
}