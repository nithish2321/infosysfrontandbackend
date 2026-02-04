package com.ompt.Ompt.DTO;


import lombok.*;

@Getter
@AllArgsConstructor
public class DoctorResponseDTO {
    private Long id;
    private String name;
    private String email;
    private String hospitalName;
    private boolean active;
}
