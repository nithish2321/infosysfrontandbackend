package com.ompt.Ompt.Controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.ompt.Ompt.DTO.DoctorRegisterRequestDTO;
import com.ompt.Ompt.DTO.DoctorResponseDTO;
import com.ompt.Ompt.model.User;
import com.ompt.Ompt.repository.UserRepository;
import com.ompt.Ompt.service.AdminDoctorService;
import com.ompt.Ompt.service.DoctorProfileService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/doctors")
@AllArgsConstructor
public class AdminDoctorController {

    private final AdminDoctorService adminDoctorService;
    private final DoctorProfileService doctorProfileService;
    private final UserRepository userRepository;

    @PostMapping
    public ResponseEntity<DoctorResponseDTO> registerDoctor(
            @Valid @RequestBody DoctorRegisterRequestDTO request,
            Authentication authentication
    ) {
        DoctorResponseDTO response = adminDoctorService.registerDoctor(request, authentication);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<JsonNode>> listDoctors(Authentication authentication) {
        User admin = userRepository.findByEmailIgnoreCase(authentication.getName())
                .orElseThrow(() -> new IllegalStateException("Admin not found"));
        return ResponseEntity.ok(doctorProfileService.listProfilesByHospital(admin.getHospital()));
    }

    @GetMapping("/template")
    public ResponseEntity<JsonNode> getTemplate() {
        return ResponseEntity.ok(doctorProfileService.getTemplate());
    }

    @PostMapping("/profile")
    public ResponseEntity<JsonNode> createDoctorProfile(
            @RequestBody JsonNode profileJson,
            Authentication authentication
    ) {
        User admin = userRepository.findByEmailIgnoreCase(authentication.getName())
                .orElseThrow(() -> new IllegalStateException("Admin not found"));
        JsonNode response = doctorProfileService.createDoctorFromProfile(admin, profileJson);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{doctorId}")
    public ResponseEntity<JsonNode> updateDoctorProfile(
            @PathVariable Long doctorId,
            @RequestBody JsonNode profileJson,
            Authentication authentication
    ) {
        User admin = userRepository.findByEmailIgnoreCase(authentication.getName())
                .orElseThrow(() -> new IllegalStateException("Admin not found"));
        JsonNode response = doctorProfileService.updateProfile(admin, doctorId, profileJson);
        return ResponseEntity.ok(response);
    }
}
