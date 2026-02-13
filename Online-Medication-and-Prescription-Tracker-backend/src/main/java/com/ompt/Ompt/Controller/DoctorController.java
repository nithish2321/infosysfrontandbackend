package com.ompt.Ompt.Controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.ompt.Ompt.model.User;
import com.ompt.Ompt.repository.UserRepository;
import com.ompt.Ompt.service.DoctorProfileService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/doctor")
@AllArgsConstructor
public class DoctorController {

    private final UserRepository userRepository;
    private final DoctorProfileService doctorProfileService;

    @GetMapping("/profile")
    public ResponseEntity<JsonNode> getProfile(Authentication authentication) {
        User doctor = userRepository.findByEmailIgnoreCase(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND, "User not found"));
        return ResponseEntity.ok(doctorProfileService.getOwnProfile(doctor));
    }

    @PutMapping("/profile")
    public ResponseEntity<JsonNode> updateProfile(
            @RequestBody JsonNode profileJson,
            Authentication authentication
    ) {
        User doctor = userRepository.findByEmailIgnoreCase(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND, "User not found"));
        return ResponseEntity.ok(doctorProfileService.updateOwnProfile(doctor, profileJson));
    }
}
