package com.ompt.Ompt.DTO;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

@Getter



public class ForgotPasswordDTO {

    @NotBlank(message = "email is required")
    @Email(message = "Invalid email")
    private String email;
}
