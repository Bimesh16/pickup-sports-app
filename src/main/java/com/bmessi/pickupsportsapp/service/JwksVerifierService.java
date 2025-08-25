package com.bmessi.pickupsportsapp.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.JwtParser;
import io.jsonwebtoken.Jwts;
import org.springframework.stereotype.Service;

import java.math.BigInteger;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.security.KeyFactory;
import java.security.PublicKey;
import java.security.spec.RSAPublicKeySpec;
import java.time.Duration;
import java.util.Base64;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class JwksVerifierService {

    private static final HttpClient CLIENT = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(5))
            .build();

    private final Map<String, CachedJwks> cache = new ConcurrentHashMap<>();

    public Jws<Claims> verify(String token, String expectedIssuer, String expectedAudience, String jwksUrl) {
        Header header = parseHeader(token);
        if (header.kid() == null) throw new IllegalArgumentException("missing kid");
        PublicKey key = resolveKey(jwksUrl, header.kid());
        JwtParser parser = Jwts.parser()
                .requireIssuer(expectedIssuer)
                .requireAudience(expectedAudience)
                .verifyWith(key)
                .build();
        return parser.parseSignedClaims(token);
    }

    private PublicKey resolveKey(String jwksUrl, String kid) {
        CachedJwks jwks = cache.compute(jwksUrl, (url, old) -> {
            if (old != null && !old.isExpired()) return old;
            try {
                String json = fetch(url);
                return CachedJwks.parse(json, Duration.ofMinutes(10));
            } catch (Exception e) {
                return old != null ? old : new CachedJwks(Map.of(), System.currentTimeMillis() + 60_000);
            }
        });
        Map<String, PubKeyParams> keys = jwks.keys();
        PubKeyParams p = keys.get(kid);
        if (p == null) throw new IllegalArgumentException("kid not found");
        try {
            RSAPublicKeySpec spec = new RSAPublicKeySpec(new BigInteger(1, base64UrlDecode(p.n)), new BigInteger(1, base64UrlDecode(p.e)));
            return KeyFactory.getInstance("RSA").generatePublic(spec);
        } catch (Exception e) {
            throw new IllegalArgumentException("invalid jwk", e);
        }
    }

    private static String fetch(String url) throws Exception {
        HttpRequest req = HttpRequest.newBuilder(URI.create(url)).GET().timeout(Duration.ofSeconds(5)).build();
        HttpResponse<String> resp = CLIENT.send(req, HttpResponse.BodyHandlers.ofString());
        if (resp.statusCode() != 200) throw new IllegalStateException("jwks fetch failed: " + resp.statusCode());
        return resp.body();
    }

    private static byte[] base64UrlDecode(String s) {
        return Base64.getUrlDecoder().decode(s);
    }

    private static Header parseHeader(String jwt) {
        String[] parts = jwt.split("\\.");
        if (parts.length < 2) throw new IllegalArgumentException("invalid jwt");
        String json = new String(Base64.getUrlDecoder().decode(parts[0]), java.nio.charset.StandardCharsets.UTF_8);
        try {
            Map<String, Object> map = new com.fasterxml.jackson.databind.ObjectMapper().readValue(json, Map.class);
            return new Header((String) map.get("kid"), (String) map.get("alg"));
        } catch (Exception e) {
            throw new IllegalArgumentException("invalid jwt header json", e);
        }
    }

    private record Header(String kid, String alg) {}

    private record PubKeyParams(String n, String e) {}

    private record CachedJwks(Map<String, PubKeyParams> keys, long expiresAt) {
        boolean isExpired() { return System.currentTimeMillis() > expiresAt; }

        static CachedJwks parse(String json, Duration ttl) throws Exception {
            var mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            Map<String, Object> payload = mapper.readValue(json, Map.class);
            java.util.List<Map<String, String>> arr = (java.util.List<Map<String, String>>) payload.get("keys");
            Map<String, PubKeyParams> map = new java.util.HashMap<>();
            if (arr != null) {
                for (Map<String, String> k : arr) {
                    String kid = k.get("kid");
                    String n = k.get("n");
                    String e = k.get("e");
                    if (kid != null && n != null && e != null) {
                        map.put(kid, new PubKeyParams(n, e));
                    }
                }
            }
            return new CachedJwks(map, System.currentTimeMillis() + ttl.toMillis());
        }
    }
}
