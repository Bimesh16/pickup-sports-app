package unit.com.bmessi.pickupsportsapp.service;

import com.bmessi.pickupsportsapp.entity.SocialAccount;
import com.bmessi.pickupsportsapp.entity.User;
import com.bmessi.pickupsportsapp.repository.SocialAccountRepository;
import com.bmessi.pickupsportsapp.repository.UserRepository;
import com.bmessi.pickupsportsapp.repository.VerifiedUserRepository;
import com.bmessi.pickupsportsapp.service.JwksVerifierService;
import com.bmessi.pickupsportsapp.service.SocialAuthService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SocialAuthServiceTest {

    @Mock
    JwksVerifierService jwks;
    @Mock UserRepository users;
    @Mock SocialAccountRepository socials;
    @Mock VerifiedUserRepository verified;
    @Mock PasswordEncoder encoder;

    @Test
    void loginOrLink_provisionsUser_whenNotLinkedAndNoUserExists() {
        SocialAuthService svc = new SocialAuthService(
                jwks, "iss", "aud", "jwks",
                "issA", "audA", "jwksA",
                users, socials, verified, encoder
        );
        Claims claims = mock(Claims.class);
        when(claims.get("sub", String.class)).thenReturn("sub-123");
        when(claims.get("email")).thenReturn("alice@example.com");
        when(claims.get("email_verified")).thenReturn(true);
        Jws<Claims> jws = mock(Jws.class);
        when(jws.getPayload()).thenReturn(claims);
        when(jwks.verify(anyString(), anyString(), anyString(), anyString())).thenReturn(jws);

        when(socials.findByProviderAndSubject(anyString(), anyString())).thenReturn(Optional.empty());
        when(users.findByUsername("alice@example.com")).thenReturn(null);
        when(encoder.encode(anyString())).thenReturn("hashed");
        when(users.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));
        when(socials.save(any(SocialAccount.class))).thenAnswer(inv -> inv.getArgument(0));

        String username = svc.loginOrLink("google", "token");

        assertEquals("alice@example.com", username);
        verify(users).save(any(User.class));
        verify(socials).save(any(SocialAccount.class));
    }

    @Test
    void loginOrLink_linksExistingUserByEmail() {
        SocialAuthService svc = new SocialAuthService(
                jwks, "iss", "aud", "jwks",
                "issA", "audA", "jwksA",
                users, socials, verified, encoder
        );
        Claims claims = mock(Claims.class);
        when(claims.get("sub", String.class)).thenReturn("sub-999");
        when(claims.get("email")).thenReturn("bob@example.com");
        Jws<Claims> jws = mock(Jws.class);
        when(jws.getPayload()).thenReturn(claims);
        when(jwks.verify(anyString(), anyString(), anyString(), anyString())).thenReturn(jws);

        User existing = User.builder().id(5L).username("bob@example.com").password("x").build();
        when(users.findByUsername("bob@example.com")).thenReturn(existing);
        when(socials.findByProviderAndSubject(anyString(), anyString())).thenReturn(Optional.empty());
        when(socials.save(any(SocialAccount.class))).thenAnswer(inv -> inv.getArgument(0));

        String username = svc.loginOrLink("google", "token");

        assertEquals("bob@example.com", username);
        verify(socials).save(any(SocialAccount.class));
        verify(users, never()).save(any());
    }
}
