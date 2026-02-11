package com.ompt.Ompt.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class PharmacyAvailabilityDTO {
    private Long inventoryItemId;
    private String medicineName;
    private String dosage;
    private int quantity;
    private Double price;
    private Long pharmacyId;
    private String pharmacyName;
    private String pharmacyLocation;
}
