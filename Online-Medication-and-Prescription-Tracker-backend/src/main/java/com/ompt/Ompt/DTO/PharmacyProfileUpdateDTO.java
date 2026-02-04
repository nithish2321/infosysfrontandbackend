package com.ompt.Ompt.DTO;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class PharmacyProfileUpdateDTO {

    @NotBlank(message = "Pharmacy name is required")
    private String pharmacyName;

    @NotBlank(message = "Location is required")
    private String location;

    @NotBlank(message = "email is required")
    @Email(message = "Invalid email")
    private String email;
}
