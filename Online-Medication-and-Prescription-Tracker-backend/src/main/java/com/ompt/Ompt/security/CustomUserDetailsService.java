package com.ompt.Ompt.security;

import com.ompt.Ompt.model.Pharmacy;
import com.ompt.Ompt.model.User;
import com.ompt.Ompt.repository.PharmacyRepository;
import com.ompt.Ompt.repository.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;
    private final PharmacyRepository pharmacyRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {

        User user = userRepository.findByEmailIgnoreCase(email).orElse(null);

        if (user != null) {
            return org.springframework.security.core.userdetails.User
                    .withUsername(user.getEmail())
                    .password(user.getPassword())
                    .authorities("ROLE_" + user.getRole().name())
                    .build();
        }

        Pharmacy pharmacy = pharmacyRepository
                .findByEmailIgnoreCase(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        return org.springframework.security.core.userdetails.User
                .withUsername(pharmacy.getEmail())
                .password(pharmacy.getPassword())
                .authorities("ROLE_PHARMACY")
                .build();
    }
}
