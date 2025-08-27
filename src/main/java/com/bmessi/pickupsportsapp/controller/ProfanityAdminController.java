package com.bmessi.pickupsportsapp.controller;

import com.bmessi.pickupsportsapp.service.HostActionAuditService;
import com.bmessi.pickupsportsapp.service.chat.ProfanityFilterService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import static com.bmessi.pickupsportsapp.web.ApiResponseUtils.noStore;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin/profanity")
@RequiredArgsConstructor
public class ProfanityAdminController {

    private final ProfanityFilterService profanity;
    private final HostActionAuditService hostAuditService;

    @GetMapping("/words")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<com.bmessi.pickupsportsapp.dto.api.WordsResponse> listWords() {
        java.util.List<String> words = profanity.listWords();
        return ResponseEntity.ok().headers(noStore()).body(new com.bmessi.pickupsportsapp.dto.api.WordsResponse(words.size(), words));
    }

    @PutMapping("/words")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<com.bmessi.pickupsportsapp.dto.api.ReplaceResultResponse> replaceAll(@RequestBody java.util.List<String> words, java.security.Principal principal) {
        profanity.replaceAllWords(words);
        String actor = principal != null ? principal.getName() : "admin";
        try { hostAuditService.record(actor, "profanity_replace_all", "profanity", null, String.join(",", words)); } catch (Exception ignore) {}
        return ResponseEntity.ok().headers(noStore()).body(new com.bmessi.pickupsportsapp.dto.api.ReplaceResultResponse("Replaced", profanity.listWords().size()));
    }

    @PostMapping("/words/{word}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<com.bmessi.pickupsportsapp.dto.api.MessageResponse> addWord(@PathVariable String word, java.security.Principal principal) {
        profanity.addWord(word);
        String actor = principal != null ? principal.getName() : "admin";
        try { hostAuditService.record(actor, "profanity_add_word", "profanity", null, word); } catch (Exception ignore) {}
        return ResponseEntity.ok().headers(noStore()).body(new com.bmessi.pickupsportsapp.dto.api.MessageResponse("Added"));
    }

    @DeleteMapping("/words/{word}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<com.bmessi.pickupsportsapp.dto.api.MessageResponse> removeWord(@PathVariable String word, java.security.Principal principal) {
        profanity.removeWord(word);
        String actor = principal != null ? principal.getName() : "admin";
        try { hostAuditService.record(actor, "profanity_remove_word", "profanity", null, word); } catch (Exception ignore) {}
        return ResponseEntity.ok().headers(noStore()).body(new com.bmessi.pickupsportsapp.dto.api.MessageResponse("Removed"));
    }

    @GetMapping("/config")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<com.bmessi.pickupsportsapp.dto.api.ProfanityConfigResponse> getConfig() {
        return ResponseEntity.ok().headers(noStore()).body(new com.bmessi.pickupsportsapp.dto.api.ProfanityConfigResponse(
                profanity.isEnabled(), profanity.shouldReject()
        ));
    }

    public record UpdateConfig(boolean enabled, boolean reject) {}

    @PutMapping("/config")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<com.bmessi.pickupsportsapp.dto.api.ProfanityConfigResponse> updateConfig(@RequestBody UpdateConfig req, java.security.Principal principal) {
        profanity.setEnabled(req.enabled());
        profanity.setReject(req.reject());
        String actor = principal != null ? principal.getName() : "admin";
        try { hostAuditService.record(actor, "profanity_update_config", "profanity", null, "enabled=" + req.enabled() + ",reject=" + req.reject()); } catch (Exception ignore) {}
        return ResponseEntity.ok().headers(noStore()).body(new com.bmessi.pickupsportsapp.dto.api.ProfanityConfigResponse(
                profanity.isEnabled(), profanity.shouldReject()
        ));
    }

    @PostMapping("/reload")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<com.bmessi.pickupsportsapp.dto.api.ReplaceResultResponse> reload(java.security.Principal principal) {
        profanity.reloadFromFile();
        String actor = principal != null ? principal.getName() : "admin";
        try { hostAuditService.record(actor, "profanity_reload", "profanity", null, null); } catch (Exception ignore) {}
        return ResponseEntity.ok().headers(noStore()).body(new com.bmessi.pickupsportsapp.dto.api.ReplaceResultResponse(
                "Reloaded from file", profanity.listWords().size()
        ));
    }

    
}
