package com.bmessi.pickupsportsapp.controller;

import com.bmessi.pickupsportsapp.entity.SavedSearchEntity;
import com.bmessi.pickupsportsapp.service.SavedSearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

import static com.bmessi.pickupsportsapp.web.ApiResponseUtils.noStore;

@RestController
@RequestMapping("/saved-searches")
@RequiredArgsConstructor
public class SavedSearchController {

    private final SavedSearchService service;

    public record SavedSearchRequest(String sport, String location, Integer radiusKm) {}

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<SavedSearchEntity>> list(Principal principal) {
        List<SavedSearchEntity> items = service.list(principal.getName());
        return ResponseEntity.ok().headers(noStore()).body(items);
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<com.bmessi.pickupsportsapp.dto.api.IdResponse> create(@RequestBody SavedSearchRequest req, Principal principal) {
        SavedSearchEntity entity = SavedSearchEntity.builder()
                .sport(req.sport())
                .location(req.location())
                .radiusKm(req.radiusKm())
                .build();
        SavedSearchEntity saved = service.create(principal.getName(), entity);
        return ResponseEntity.ok().headers(noStore()).body(new com.bmessi.pickupsportsapp.dto.api.IdResponse(saved.getId()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<SavedSearchEntity> update(@PathVariable Long id, @RequestBody SavedSearchRequest req, Principal principal) {
        SavedSearchEntity entity = SavedSearchEntity.builder()
                .sport(req.sport())
                .location(req.location())
                .radiusKm(req.radiusKm())
                .build();
        SavedSearchEntity saved = service.update(principal.getName(), id, entity);
        return ResponseEntity.ok().headers(noStore()).body(saved);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<com.bmessi.pickupsportsapp.dto.api.StatusResponse> delete(@PathVariable Long id, Principal principal) {
        service.delete(principal.getName(), id);
        return ResponseEntity.ok().headers(noStore()).body(new com.bmessi.pickupsportsapp.dto.api.StatusResponse("deleted"));
    }
}
