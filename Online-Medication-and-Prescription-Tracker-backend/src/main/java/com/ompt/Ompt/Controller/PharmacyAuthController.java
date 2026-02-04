package com.ompt.Ompt.Controller;

import com.ompt.Ompt.DTO.PharmacyAuthResponseDTO;
import com.ompt.Ompt.DTO.PharmacyLoginRequestDTO;
import com.ompt.Ompt.DTO.PharmacyProfileDTO;
import com.ompt.Ompt.DTO.PharmacyRegisterRequestDTO;
import com.ompt.Ompt.service.PharmacyService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth/pharmacy")
@AllArgsConstructor
public class PharmacyAuthController {

    private final PharmacyService pharmacyService;

    @PostMapping("/register")
    public ResponseEntity<PharmacyProfileDTO> register(
            @Valid @RequestBody PharmacyRegisterRequestDTO request
    ) {
        PharmacyProfileDTO response = pharmacyService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<PharmacyAuthResponseDTO> login(
            @Valid @RequestBody PharmacyLoginRequestDTO request
    ) {
        PharmacyAuthResponseDTO response = pharmacyService.login(request);
        return ResponseEntity.ok(response);
    }
}
