package com.ompt.Ompt.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class InventoryItemResponseDTO {
    private Long id;
    private String name;
    private String dosage;
    private int quantity;
    private Double price;
    private LocalDate expiry;
    private boolean lowStock;
}
