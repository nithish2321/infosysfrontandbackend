package com.ompt.Ompt.repository;

import com.ompt.Ompt.model.PatientRecord;
import com.ompt.Ompt.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PatientRecordRepository extends JpaRepository<PatientRecord, Long> {
    Optional<PatientRecord> findByUser(User user);
    List<PatientRecord> findByUser_Hospital_Id(Long hospitalId);
    List<PatientRecord> findByAssignedDoctor(User doctor);
}
