package com.bmessi.pickupsportsapp.entity;

import com.bmessi.pickupsportsapp.model.SkillLevel;
import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

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

    @Column(length = 1000)
    private String bio;

    @Column(length = 512)
    private String avatarUrl;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private SkillLevel skillLevel;

    // Aggregates maintained by rating service
    @Column
    private Double ratingAverage;

    @Column
    private Integer ratingCount;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Game> games = new ArrayList<>();
}