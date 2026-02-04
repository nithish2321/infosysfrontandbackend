package com.ompt.Ompt.repository;

import com.ompt.Ompt.model.Hospital;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface HospitalRepository extends JpaRepository<Hospital, Long> {

    Optional<Hospital> findByNameIgnoreCase(String name);
}
