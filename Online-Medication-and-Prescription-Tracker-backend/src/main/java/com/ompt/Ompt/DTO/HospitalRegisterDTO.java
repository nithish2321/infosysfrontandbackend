package com.ompt.Ompt.DTO;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor


public class HospitalRegisterDTO {

    @NotBlank(message = "Hospital name is required")
    private String hospitalName;

    @NotBlank(message = "Admin name is required")
    private String adminName;

    @Email(message = "Invalid email")
    @NotBlank(message = "Email is required")
    private String  email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;
}
