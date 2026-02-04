package com.ompt.Ompt.DTO;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

@Getter
public class VerifyResetCodeDTO {

    @NotBlank(message = "email is required")
    @Email(message = "Invalid email")
    private String email;

    @NotBlank(message = "Verification code is required")
    private String code;
}
