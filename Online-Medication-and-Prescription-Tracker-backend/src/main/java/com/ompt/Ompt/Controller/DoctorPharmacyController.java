package com.ompt.Ompt.Controller;

import com.ompt.Ompt.DTO.PharmacyAvailabilityDTO;
import com.ompt.Ompt.service.PharmacyService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/doctor/pharmacies")
@AllArgsConstructor
public class DoctorPharmacyController {

    private final PharmacyService pharmacyService;

    @GetMapping("/availability")
    public ResponseEntity<List<PharmacyAvailabilityDTO>> listAvailability(
            @RequestParam String medicineName
    ) {
        return ResponseEntity.ok(pharmacyService.listAvailability(medicineName));
    }
}
