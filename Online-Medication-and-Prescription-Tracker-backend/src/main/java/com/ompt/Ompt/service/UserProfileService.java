package com.ompt.Ompt.service;

import com.ompt.Ompt.DTO.UserProfileRequestDTO;
import com.ompt.Ompt.model.User;
import com.ompt.Ompt.model.UserProfile;
import com.ompt.Ompt.repository.UserProfileRepository;
import com.ompt.Ompt.repository.UserRepository;
import lombok.*;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor

public class UserProfileService {
    private UserRepository userRepository;
    private final UserProfileRepository profileRepository;

    public void saveProfile(String email, UserProfileRequestDTO request) {

        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        UserProfile profile = profileRepository
                .findByUser(user)
                .orElse(new UserProfile());

        profile.setUser(user);
        profile.setPatientName(request.getPatientName());
        profile.setGender(request.getGender());
        profile.setAge(request.getAge());
        profile.setPhoneNumber(request.getPhoneNumber());
        profile.setBloodGroup(request.getBloodGroup());
        profile.setAddress(request.getAddress());

        profileRepository.save(profile);
    }


}
