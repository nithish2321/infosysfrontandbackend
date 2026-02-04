package com.ompt.Ompt.DTO;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ResetPasswordDTO {
    @NotBlank(message = "Reset token is reqred")
    private String token;
    @NotBlank(message = "New Password is required")
    @Size(min =8, message = "Password must be at least 8 characters")
    private String newPassword;
}
