package com.lias.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/roles")
public class RoleController {
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getRoles() {
        return ResponseEntity.ok(List.of(
            Map.of("id", 1, "code", "PERMANENT", "label", "Membre permanent"),
            Map.of("id", 2, "code", "ASSOCIE",   "label", "Membre associe"),
            Map.of("id", 3, "code", "DOCTORANT", "label", "Doctorant")
        ));
    }
}