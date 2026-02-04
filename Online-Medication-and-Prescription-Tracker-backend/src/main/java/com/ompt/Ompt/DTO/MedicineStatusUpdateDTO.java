package com.ompt.Ompt.DTO;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class MedicineStatusUpdateDTO {

    @NotBlank(message = "Medicine id is required")
    private String medicineId;

    @NotBlank(message = "Time is required")
    private String time;

    @NotBlank(message = "Status is required")
    private String status;

    private String reason;
}
