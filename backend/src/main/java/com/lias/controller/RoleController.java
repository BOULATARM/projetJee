package com.lias.controller;

import com.lias.dto.response.RoleDto;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/roles")
public class RoleController {
    @GetMapping
    public ResponseEntity<List<RoleDto>> getRoles() {
        return ResponseEntity.ok(List.of(
            new RoleDto(1, "PERMANENT", "Membre permanent"),
            new RoleDto(2, "ASSOCIE",   "Membre associé"),
            new RoleDto(3, "DOCTORANT", "Doctorant"),
            new RoleDto(4, "RETRAITE",  "Retraité"),
            new RoleDto(5, "ANCIEN",    "Ancien membre")
        ));
    }
}
