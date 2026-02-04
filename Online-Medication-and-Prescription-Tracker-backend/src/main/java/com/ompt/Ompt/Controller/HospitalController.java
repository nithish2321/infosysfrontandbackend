package com.ompt.Ompt.Controller;

import com.ompt.Ompt.DTO.HospitalRegisterDTO;
import com.ompt.Ompt.DTO.HospitalResponse;
import com.ompt.Ompt.service.HospitalService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Getter
@AllArgsConstructor
@RestController
@RequestMapping("/api/hospitals")
public class HospitalController {

    private final HospitalService hospitalService;

    @PostMapping("/register")
    public ResponseEntity<HospitalResponse> register(
            @Valid @RequestBody HospitalRegisterDTO request
    ) {
        HospitalResponse response =
                hospitalService.registerHospital(request);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }


}
