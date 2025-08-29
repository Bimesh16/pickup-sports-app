package unit.com.bmessi.pickupsportsapp.service;

import com.bmessi.pickupsportsapp.entity.SavedSearchEntity;
import com.bmessi.pickupsportsapp.entity.User;
import com.bmessi.pickupsportsapp.repository.SavedSearchRepository;
import com.bmessi.pickupsportsapp.repository.UserRepository;
import com.bmessi.pickupsportsapp.service.SavedSearchService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SavedSearchServiceTest {

    @Mock SavedSearchRepository repo;
    @Mock UserRepository users;
    @InjectMocks SavedSearchService service;

    User user;

    @BeforeEach
    void setup() {
        user = User.builder().id(1L).username("alice").password("pw").build();
    }

    @Test
    void crudFlow() {
        when(users.findOptionalByUsername("alice")).thenReturn(Optional.of(user));
        SavedSearchEntity toSave = SavedSearchEntity.builder().sport("Soccer").location("Park").radiusKm(5).build();
        SavedSearchEntity saved = SavedSearchEntity.builder().id(10L).sport("Soccer").location("Park").radiusKm(5).user(user).build();
        when(repo.save(any(SavedSearchEntity.class))).thenReturn(saved);

        SavedSearchEntity created = service.create("alice", toSave);
        assertEquals(10L, created.getId());
        verify(repo).save(any(SavedSearchEntity.class));

        when(repo.findByUser_Username("alice")).thenReturn(List.of(saved));
        List<SavedSearchEntity> list = service.list("alice");
        assertEquals(1, list.size());

        when(repo.findById(10L)).thenReturn(Optional.of(saved));
        SavedSearchEntity updates = SavedSearchEntity.builder().sport("Basketball").build();
        when(repo.save(any(SavedSearchEntity.class))).thenReturn(saved);
        service.update("alice", 10L, updates);
        verify(repo, times(2)).save(any(SavedSearchEntity.class));

        service.delete("alice", 10L);
        verify(repo).delete(saved);
    }
}
