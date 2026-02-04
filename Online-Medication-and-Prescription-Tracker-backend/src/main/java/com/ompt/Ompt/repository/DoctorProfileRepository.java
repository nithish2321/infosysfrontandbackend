package com.ompt.Ompt.repository;

import com.ompt.Ompt.model.DoctorProfile;
import com.ompt.Ompt.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DoctorProfileRepository extends JpaRepository<DoctorProfile, Long> {
    Optional<DoctorProfile> findByUser(User user);
    List<DoctorProfile> findByUser_Hospital_Id(Long hospitalId);
}
