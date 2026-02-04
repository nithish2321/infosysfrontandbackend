package com.ompt.Ompt.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class PharmacyProfileDTO {
    private Long id;
    private String pharmacyName;
    private String location;
    private String email;
}
