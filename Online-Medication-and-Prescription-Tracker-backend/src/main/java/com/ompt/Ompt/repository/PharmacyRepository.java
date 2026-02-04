package com.ompt.Ompt.repository;

import com.ompt.Ompt.model.Pharmacy;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PharmacyRepository extends JpaRepository<Pharmacy, Long> {
    Optional<Pharmacy> findByEmailIgnoreCase(String email);
    boolean existsByEmailIgnoreCase(String email);
}
