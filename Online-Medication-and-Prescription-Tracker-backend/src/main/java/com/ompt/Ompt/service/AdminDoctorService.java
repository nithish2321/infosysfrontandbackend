package com.ompt.Ompt.service;

import com.ompt.Ompt.DTO.DoctorRegisterRequestDTO;
import com.ompt.Ompt.DTO.DoctorResponseDTO;
import com.ompt.Ompt.model.AccountStatus;
import com.ompt.Ompt.model.Role;
import com.ompt.Ompt.model.User;
import com.ompt.Ompt.repository.UserRepository;
import com.ompt.Ompt.service.DoctorProfileService;
import lombok.AllArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@AllArgsConstructor
public class AdminDoctorService {

    private final UserRepository userRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final DoctorProfileService doctorProfileService;
    public DoctorResponseDTO registerDoctor(
            DoctorRegisterRequestDTO request,
            Authentication authentication
    ) {

        User admin = userRepository
                .findByEmailIgnoreCase(authentication.getName())
                .orElseThrow(() -> new IllegalStateException("Admin not found"));

        User doctor = registerDoctorForAdmin(admin, request);
        return new DoctorResponseDTO(
                doctor.getId(),
                doctor.getName(),
                doctor.getEmail(),
                admin.getHospital().getName(),
                true
        );
    }

    public User registerDoctorForAdmin(User admin, DoctorRegisterRequestDTO request) {
        if (admin.getRole() != Role.ADMIN) {
            throw new IllegalStateException("Only admin can register doctors");
        }
        if (userRepository.existsByEmailIgnoreCase(request.getEmail())) {
            throw new IllegalArgumentException("Doctor email already exists");
        }

        User doctor = new User();
        doctor.setName(request.getName());
        doctor.setStatus(AccountStatus.PENDING);
        doctor.setEmail(request.getEmail().toLowerCase());
        doctor.setPassword(null);
        doctor.setRole(Role.DOCTOR);
        doctor.setHospital(admin.getHospital());

        String token = UUID.randomUUID().toString();
        doctor.setResetTokenHash(passwordEncoder.encode(token));
        doctor.setResetTokenExpiry(LocalDateTime.now().plusHours(24));

        userRepository.save(doctor);
        doctorProfileService.getOrCreateProfile(doctor);

        emailService.sendDoctorWelcomeMail(
                doctor.getEmail(),
                admin.getHospital().getName(),
                token
        );

        return doctor;
    }
}
