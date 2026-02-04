package com.ompt.Ompt.repository;

import com.ompt.Ompt.model.User;
import com.ompt.Ompt.model.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserProfileRepository extends JpaRepository<UserProfile, Long> {
    Optional<UserProfile> findByUser(User user);
}