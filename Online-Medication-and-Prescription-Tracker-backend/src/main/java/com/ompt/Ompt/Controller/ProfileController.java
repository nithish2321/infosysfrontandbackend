package com.ompt.Ompt.Controller;

import com.ompt.Ompt.DTO.UserProfileRequestDTO;
import com.ompt.Ompt.repository.UserRepository;
import com.ompt.Ompt.service.UserProfileService;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
@AllArgsConstructor
public class ProfileController {

    private final UserRepository userRepository;
    private final UserProfileService userProfileService;

    @PostMapping("/patient-profile")
    public ResponseEntity<Void> saveProfile(
            @Valid @RequestBody UserProfileRequestDTO request,
            Authentication authentication) {

        String email = authentication.getName();
        userProfileService.saveProfile(email, request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }


}