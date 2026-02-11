package com.ompt.Ompt.Controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.ompt.Ompt.DTO.AssignMedicineRequestDTO;
import com.ompt.Ompt.DTO.DeliveryUpdateDTO;
import com.ompt.Ompt.DTO.DoctorRatingRequestDTO;
import com.ompt.Ompt.DTO.MedicineStatusUpdateDTO;
import com.ompt.Ompt.model.Role;
import com.ompt.Ompt.model.User;
import com.ompt.Ompt.repository.UserRepository;
import com.ompt.Ompt.service.PatientRecordService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/patients")
@AllArgsConstructor
public class PatientController {

    private final PatientRecordService patientRecordService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<JsonNode>> listPatients(Authentication authentication) {
        User user = userRepository.findByEmailIgnoreCase(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND, "User not found"));

        if (user.getRole() == Role.ADMIN) {
            return ResponseEntity.ok(patientRecordService.listByHospital(user.getHospital().getId()));
        }
        if (user.getRole() == Role.DOCTOR) {
            return ResponseEntity.ok(patientRecordService.listByDoctor(user));
        }

        return ResponseEntity.ok(List.of(patientRecordService.getOrCreateRecord(user)));
    }

    @GetMapping("/me")
    public ResponseEntity<JsonNode> getMyRecord(Authentication authentication) {
        User user = userRepository.findByEmailIgnoreCase(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND, "User not found"));
        return ResponseEntity.ok(patientRecordService.getOrCreateRecord(user));
    }

    @PutMapping("/{patientId}")
    public ResponseEntity<JsonNode> updatePatientProfile(
            @PathVariable Long patientId,
            @RequestBody JsonNode payload,
            Authentication authentication
    ) {
        User user = userRepository.findByEmailIgnoreCase(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND, "User not found"));

        if (!user.getId().equals(patientId)) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.FORBIDDEN, "Cannot update another patient");
        }

        return ResponseEntity.ok(patientRecordService.updatePatientRecord(user, payload));
    }

    @PostMapping("/{patientId}/medicines")
    public ResponseEntity<JsonNode> assignMedicine(
            @PathVariable Long patientId,
            @Valid @RequestBody AssignMedicineRequestDTO request,
            Authentication authentication
    ) {
        User doctor = userRepository.findByEmailIgnoreCase(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND, "User not found"));
        return ResponseEntity.ok(patientRecordService.assignMedicine(doctor, patientId, request));
    }

    @PatchMapping("/medicines/status")
    public ResponseEntity<JsonNode> updateMedicineStatus(
            @Valid @RequestBody MedicineStatusUpdateDTO request,
            Authentication authentication
    ) {
        User patient = userRepository.findByEmailIgnoreCase(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND, "User not found"));
        return ResponseEntity.ok(patientRecordService.updateMedicineStatus(patient, request));
    }

    @PatchMapping("/medicines/{medicineId}/delivery")
    public ResponseEntity<JsonNode> updateDeliveryStatus(
            @PathVariable String medicineId,
            @Valid @RequestBody DeliveryUpdateDTO request,
            Authentication authentication
    ) {
        User patient = userRepository.findByEmailIgnoreCase(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND, "User not found"));
        return ResponseEntity.ok(patientRecordService.updateDeliveryStatus(patient, medicineId, request.getStatus()));
    }

    @PostMapping("/doctor-rating")
    public ResponseEntity<JsonNode> rateDoctor(
            @Valid @RequestBody DoctorRatingRequestDTO request,
            Authentication authentication
    ) {
        User patient = userRepository.findByEmailIgnoreCase(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND, "User not found"));
        return ResponseEntity.ok(patientRecordService.rateDoctor(patient, request));
    }
}
