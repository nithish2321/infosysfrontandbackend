package com.ompt.Ompt.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@Entity
@Table(name = "pharmacy_inventory")
public class InventoryItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pharmacy_id", nullable = false)
    private Pharmacy pharmacy;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(length = 100)
    private String dosage;

    @Column(nullable = false)
    private int quantity;

    @Column
    private Double price;

    private LocalDate expiry;

    @Column(nullable = false)
    private boolean lowStock;
}
