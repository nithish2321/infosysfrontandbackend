package com.ompt.Ompt.Controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.ompt.Ompt.DTO.HospitalSummaryDTO;
import com.ompt.Ompt.DTO.MedicineMasterDTO;
import com.ompt.Ompt.repository.HospitalRepository;
import com.ompt.Ompt.service.DoctorProfileService;
import com.ompt.Ompt.service.MedicineMasterService;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/public")
@AllArgsConstructor
public class PublicController {

    private final HospitalRepository hospitalRepository;
    private final DoctorProfileService doctorProfileService;
    private final MedicineMasterService medicineMasterService;

    @GetMapping("/hospitals")
    public List<HospitalSummaryDTO> listHospitals() {
        return hospitalRepository.findAll()
                .stream()
                .map(h -> new HospitalSummaryDTO(h.getId(), h.getName()))
                .toList();
    }

    @GetMapping("/doctors")
    public List<JsonNode> listDoctors() {
        return doctorProfileService.listAllDoctors();
    }

    @GetMapping("/medicines")
    public List<MedicineMasterDTO> listMedicines() {
        return medicineMasterService.listAll();
    }
}
