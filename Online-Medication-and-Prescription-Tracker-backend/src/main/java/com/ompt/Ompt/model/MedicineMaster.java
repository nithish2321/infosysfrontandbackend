package com.ompt.Ompt.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "medicine_master")
public class MedicineMaster {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false, length = 50)
    private String strength;

    @Column(nullable = false, length = 50)
    private String type;

    @Lob
    @Column(nullable = false)
    private String defaultScheduleJson;
}
