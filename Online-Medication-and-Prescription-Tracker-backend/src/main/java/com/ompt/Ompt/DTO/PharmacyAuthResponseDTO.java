package com.ompt.Ompt.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class PharmacyAuthResponseDTO {
    private String token;
    private PharmacyProfileDTO pharmacy;
}
