package com.bmessi.pickupsportsapp.controller.admin;

import com.bmessi.pickupsportsapp.config.properties.ProfanityFilterProperties;
import com.bmessi.pickupsportsapp.service.HostActionAuditService;
import com.bmessi.pickupsportsapp.service.chat.ProfanityFilterService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin/moderation")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class ModerationAdminController {

    private final ProfanityFilterService moderation;
    private final ProfanityFilterProperties props;
    private final HostActionAuditService hostAuditService;

    public ModerationAdminController(ProfanityFilterService moderation, ProfanityFilterProperties props, HostActionAuditService hostAuditService) {
        this.moderation = moderation;
        this.props = props;
        this.hostAuditService = hostAuditService;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> status() {
        return ResponseEntity.ok(Map.of(
                "enabled", props.isEnabled(),
                "reject", props.isReject(),
                "wordsCount", moderation.listWords().size(),
                "dictionaryPath", props.getDictionaryPath(),
                "reloadOnChange", props.isReloadOnChange()
        ));
    }

    @GetMapping("/words")
    public ResponseEntity<List<String>> words() {
        return ResponseEntity.ok(moderation.listWords());
    }

    @PostMapping("/words")
    public ResponseEntity<Map<String, Object>> replace(@RequestBody List<String> words, java.security.Principal principal) {
        moderation.replaceAllWords(words);
        String actor = principal != null ? principal.getName() : "admin";
        try { hostAuditService.record(actor, "moderation_replace", "moderation", null, String.join(",", words)); } catch (Exception ignore) {}
        return ResponseEntity.ok(Map.of("message", "Dictionary replaced", "count", moderation.listWords().size()));
    }

    @PostMapping("/words/add")
    public ResponseEntity<Map<String, Object>> add(@RequestBody Map<String, String> body, java.security.Principal principal) {
        String word = body.getOrDefault("word", "");
        moderation.addWord(word);
        String actor = principal != null ? principal.getName() : "admin";
        try { hostAuditService.record(actor, "moderation_add_word", "moderation", null, word); } catch (Exception ignore) {}
        return ResponseEntity.ok(Map.of("message", "Word added", "word", word));
    }

    @DeleteMapping("/words/{word}")
    public ResponseEntity<Map<String, Object>> delete(@PathVariable String word, java.security.Principal principal) {
        moderation.removeWord(word);
        String actor = principal != null ? principal.getName() : "admin";
        try { hostAuditService.record(actor, "moderation_remove_word", "moderation", null, word); } catch (Exception ignore) {}
        return ResponseEntity.ok(Map.of("message", "Word removed", "word", word));
    }

    @PostMapping("/toggle")
    public ResponseEntity<Map<String, Object>> toggle(@RequestBody Map<String, Object> body, java.security.Principal principal) {
        if (body.containsKey("enabled")) {
            moderation.setEnabled(Boolean.parseBoolean(String.valueOf(body.get("enabled"))));
        }
        if (body.containsKey("reject")) {
            moderation.setReject(Boolean.parseBoolean(String.valueOf(body.get("reject"))));
        }
        String actor = principal != null ? principal.getName() : "admin";
        try { hostAuditService.record(actor, "moderation_toggle", "moderation", null, body.toString()); } catch (Exception ignore) {}
        return ResponseEntity.ok(Map.of(
                "enabled", props.isEnabled(),
                "reject", props.isReject()
        ));
    }

    @PostMapping("/reload")
    public ResponseEntity<Map<String, Object>> reload(java.security.Principal principal) {
        moderation.reloadFromFile();
        String actor = principal != null ? principal.getName() : "admin";
        try { hostAuditService.record(actor, "moderation_reload", "moderation", null, null); } catch (Exception ignore) {}
        return ResponseEntity.ok(Map.of("message", "Reloaded from file", "count", moderation.listWords().size()));
    }
}
