package com.ompt.Ompt.DTO;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserProfileRequestDTO {

    @NotBlank
    private String patientName;

    @NotBlank
    private String gender;

    @Min(0)
    private int age;

    @NotBlank
    private String phoneNumber;

    @NotBlank
    private String bloodGroup;

    @NotBlank
    private String address;
}
