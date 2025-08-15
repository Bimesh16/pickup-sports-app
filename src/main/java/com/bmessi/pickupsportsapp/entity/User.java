package com.bmessi.pickupsportsapp.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Entity
@Table(name = "app_user", uniqueConstraints = @UniqueConstraint(columnNames = "username"))
@Getter
@Setter
@ToString(exclude = "games")
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @Column(name = "username", unique = true, nullable = false, length = 100)
    private String username;

    @Column(nullable = false, length = 255)
    private String password;

    @Column(length = 100)
    private String preferredSport;

    @Column(length = 255)
    private String location;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Game> games = new ArrayList<>();

    // Convenience helpers to keep both sides of the association in sync
    public void addGame(Game game) {
        if (game == null) return;
        if (!this.games.contains(game)) {
            this.games.add(game);
        }
        if (game.getUser() != this) {
            game.setUser(this);
        }
    }

    public void removeGame(Game game) {
        if (game == null) return;
        this.games.remove(game);
        if (Objects.equals(game.getUser(), this)) {
            game.setUser(null);
        }
    }
}