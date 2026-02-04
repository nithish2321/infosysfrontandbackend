package com.ompt.Ompt.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class DeliveryResponseDTO {
    private Long id;
    private String patient;
    private String medicine;
    private String status;
    private LocalDateTime date;
}
