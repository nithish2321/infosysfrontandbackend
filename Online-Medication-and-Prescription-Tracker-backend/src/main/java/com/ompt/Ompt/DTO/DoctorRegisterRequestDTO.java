package com.ompt.Ompt.DTO;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DoctorRegisterRequestDTO {

    @NotBlank
    private String name;

    @Email
    @NotBlank
    private String email;
}
