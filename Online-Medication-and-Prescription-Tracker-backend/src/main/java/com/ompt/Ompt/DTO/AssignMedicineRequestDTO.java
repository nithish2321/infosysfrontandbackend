package com.ompt.Ompt.DTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class AssignMedicineRequestDTO {

    @NotBlank(message = "Medicine name is required")
    private String name;

    private String dosage;

    private String type;

    private String instructions;

    @NotNull(message = "Pharmacy inventory item is required")
    private Long inventoryItemId;

    @NotEmpty(message = "Schedule is required")
    private List<String> scheduleTimes;
}
