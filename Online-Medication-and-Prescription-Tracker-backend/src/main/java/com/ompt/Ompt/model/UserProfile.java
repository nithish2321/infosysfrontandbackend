package com.ompt.Ompt.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "UserProfiles")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class UserProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false)
    private String patientName;

    @Column(nullable = false)
    private String gender;

    @Column(nullable = false)
    private int age;

    @Column(nullable = false, length =10)
    private String phoneNumber;

    @Column(nullable = false)
    private String bloodGroup;

    @Column(nullable = false)
    private String address;
}
