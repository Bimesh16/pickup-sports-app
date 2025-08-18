package com.bmessi.pickupsportsapp.mapper;

import com.bmessi.pickupsportsapp.dto.CreateGameRequest;
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

    // User mapping
    UserDTO toUserDTO(User user);
    List<UserDTO> toUserDTOs(List<User> users);
    List<UserDTO> toUserDTOs(Set<User> users);

    // Game summaries and details
    GameSummaryDTO toGameSummaryDTO(Game game);

    @Mapping(target = "participants", source = "participants")
    @Mapping(target = "creator", source = "user")
    GameDetailsDTO toGameDetailsDTO(Game game);

    // Notification mapping
    NotificationDTO toNotificationDTO(Notification n);
    List<NotificationDTO> toNotificationDTOs(List<Notification> list);

    // CreateGameRequest -> Game mapping (MapStruct will copy latitude/longitude automatically)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "participants", ignore = true)
    @Mapping(target = "version", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Game toGame(CreateGameRequest request);
}
