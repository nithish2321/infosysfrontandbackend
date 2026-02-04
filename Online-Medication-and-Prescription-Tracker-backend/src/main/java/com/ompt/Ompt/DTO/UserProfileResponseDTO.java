package com.ompt.Ompt.DTO;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserProfileResponseDTO {
    private String patientName;
    private String gender;
    private int age;
    private String phoneNumber;
    private String bloodGroup;
    private String address;
}
