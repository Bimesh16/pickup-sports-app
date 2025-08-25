package com.bmessi.pickupsportsapp.controller;

import com.bmessi.pickupsportsapp.service.chat.ProfanityFilterService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin/profanity")
@RequiredArgsConstructor
public class ProfanityAdminController {

    private final ProfanityFilterService profanity;

    @GetMapping("/words")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<com.bmessi.pickupsportsapp.dto.api.WordsResponse> listWords() {
        java.util.List<String> words = profanity.listWords();
        return ResponseEntity.ok().headers(noStoreHeaders()).body(new com.bmessi.pickupsportsapp.dto.api.WordsResponse(words.size(), words));
    }

    @PutMapping("/words")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<com.bmessi.pickupsportsapp.dto.api.ReplaceResultResponse> replaceAll(@RequestBody java.util.List<String> words) {
        profanity.replaceAllWords(words);
        return ResponseEntity.ok().headers(noStoreHeaders()).body(new com.bmessi.pickupsportsapp.dto.api.ReplaceResultResponse("Replaced", profanity.listWords().size()));
    }

    @PostMapping("/words/{word}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<com.bmessi.pickupsportsapp.dto.api.MessageResponse> addWord(@PathVariable String word) {
        profanity.addWord(word);
        return ResponseEntity.ok().headers(noStoreHeaders()).body(new com.bmessi.pickupsportsapp.dto.api.MessageResponse("Added"));
    }

    @DeleteMapping("/words/{word}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<com.bmessi.pickupsportsapp.dto.api.MessageResponse> removeWord(@PathVariable String word) {
        profanity.removeWord(word);
        return ResponseEntity.ok().headers(noStoreHeaders()).body(new com.bmessi.pickupsportsapp.dto.api.MessageResponse("Removed"));
    }

    @GetMapping("/config")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<com.bmessi.pickupsportsapp.dto.api.ProfanityConfigResponse> getConfig() {
        return ResponseEntity.ok().headers(noStoreHeaders()).body(new com.bmessi.pickupsportsapp.dto.api.ProfanityConfigResponse(
                profanity.isEnabled(), profanity.shouldReject()
        ));
    }

    public record UpdateConfig(boolean enabled, boolean reject) {}

    @PutMapping("/config")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<com.bmessi.pickupsportsapp.dto.api.ProfanityConfigResponse> updateConfig(@RequestBody UpdateConfig req) {
        profanity.setEnabled(req.enabled());
        profanity.setReject(req.reject());
        return ResponseEntity.ok().headers(noStoreHeaders()).body(new com.bmessi.pickupsportsapp.dto.api.ProfanityConfigResponse(
                profanity.isEnabled(), profanity.shouldReject()
        ));
    }

    @PostMapping("/reload")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<com.bmessi.pickupsportsapp.dto.api.ReplaceResultResponse> reload() {
        profanity.reloadFromFile();
        return ResponseEntity.ok().headers(noStoreHeaders()).body(new com.bmessi.pickupsportsapp.dto.api.ReplaceResultResponse(
                "Reloaded from file", profanity.listWords().size()
        ));
    }

    private static HttpHeaders noStoreHeaders() {
        return com.bmessi.pickupsportsapp.web.ApiResponseUtils.noStore();
    }
}
