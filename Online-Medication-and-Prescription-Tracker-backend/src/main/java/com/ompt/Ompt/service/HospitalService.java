package com.ompt.Ompt.service;

import com.ompt.Ompt.DTO.HospitalRegisterDTO;
import com.ompt.Ompt.DTO.HospitalResponse;
import com.ompt.Ompt.model.AccountStatus;
import com.ompt.Ompt.model.Hospital;
import com.ompt.Ompt.model.Role;
import com.ompt.Ompt.model.User;
import com.ompt.Ompt.repository.HospitalRepository;
import com.ompt.Ompt.repository.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@AllArgsConstructor
public class HospitalService {

    private final HospitalRepository hospitalRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final  UserRepository userrepo;


    //Hospital Registration Service
    @Transactional
    public HospitalResponse registerHospital(HospitalRegisterDTO request) {

        hospitalRepository.findByNameIgnoreCase(request.getHospitalName())
                .ifPresent(o -> {
                    throw new IllegalArgumentException("Hospital already exists");
                });
        hospitalRepository.findByNameIgnoreCase(request.getEmail())
                .ifPresent(o -> {
                    throw new IllegalArgumentException("Email already exists");
                });

        Hospital hospital = new Hospital();
        hospital.setName(request.getHospitalName());

        Hospital savedHospital = hospitalRepository.save(hospital);

        User user = new User();
        user.setName(request.getAdminName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.ADMIN);
        user.setStatus(AccountStatus.ACTIVE);
        user.setHospital(savedHospital);
        userrepo.save(user);

        return new HospitalResponse(
                savedHospital.getId(),
                savedHospital.getName(),
                savedHospital.isActive()

        );
    }
}
