package com.urbanfix.controller;

import com.urbanfix.dto.request.GrantRoleRequest;
import com.urbanfix.dto.response.UserRoleResponse;
import com.urbanfix.service.UserRoleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/roles")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class UserRoleController {

    private final UserRoleService roleService;

    @GetMapping
    public ResponseEntity<List<UserRoleResponse>> getAllRoles() {
        return ResponseEntity.ok(roleService.findAll());
    }

    @PostMapping
    public ResponseEntity<UserRoleResponse> grantRole(@Valid @RequestBody GrantRoleRequest req) {
        return ResponseEntity.ok(roleService.grantRole(req.getUserId(), req.getRole()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> revokeRole(@PathVariable Long id) {
        roleService.revokeRole(id);
        return ResponseEntity.noContent().build();
    }
}
