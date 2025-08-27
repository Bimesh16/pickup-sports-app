package unit.com.bmessi.pickupsportsapp.controller;

import com.bmessi.pickupsportsapp.controller.game.GameController;
import com.bmessi.pickupsportsapp.dto.game.GameSummaryDTO;
import com.bmessi.pickupsportsapp.entity.game.Game;
import com.bmessi.pickupsportsapp.mapper.ApiMapper;
import com.bmessi.pickupsportsapp.repository.GameRepository;
import com.bmessi.pickupsportsapp.repository.UserRepository;
import com.bmessi.pickupsportsapp.service.notification.NotificationService;
import com.bmessi.pickupsportsapp.service.SportResolverService;
import com.bmessi.pickupsportsapp.service.AiRecommendationResilientService;
import com.bmessi.pickupsportsapp.service.chat.ChatService;
import com.bmessi.pickupsportsapp.service.SavedSearchMatchService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.web.PageableHandlerMethodArgumentResolver;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("GameController (standalone MockMvc)")
class GameControllerTest {

    private MockMvc mockMvc;

    @Mock private GameRepository gameRepository;
    @Mock private UserRepository userRepository;
    @Mock private NotificationService notificationService;
    @Mock private AiRecommendationResilientService xaiRecommendationService;
    @Mock private ApiMapper mapper;
    @Mock private ChatService chatService;
    @Mock private SportResolverService sportResolver;
    @Mock private SavedSearchMatchService savedSearchMatchService;

    @InjectMocks
    private GameController controller;

    @BeforeEach
    void setUp() {
        // Set default properties used by the controller
        ReflectionTestUtils.setField(controller, "defaultRecommendationSport", "Soccer");
        ReflectionTestUtils.setField(controller, "defaultRecommendationLocation", "Park A");

        // Build standalone MockMvc with Spring Data pageable resolver
        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setCustomArgumentResolvers(new PageableHandlerMethodArgumentResolver())
                .build();
    }

    @Test
    @DisplayName("GET /games returns 200 with empty content when repo returns empty page")
    void getGames_empty() throws Exception {
        Page<Game> empty = new PageImpl<>(List.of(), PageRequest.of(0, 10), 0);
        when(gameRepository.findAll(any(org.springframework.data.domain.Pageable.class)))
                .thenReturn(empty);

        // No mapping stub needed because page is empty (avoid unnecessary stubbing)

        mockMvc.perform(get("/games"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.totalElements").value(0));
    }
}