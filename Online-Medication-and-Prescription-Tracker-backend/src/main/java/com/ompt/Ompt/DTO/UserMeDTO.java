package com.ompt.Ompt.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class UserMeDTO {
    private Long id;
    private String name;
    private String email;
    private String role;
    private Long hospitalId;
    private String hospitalName;
}
