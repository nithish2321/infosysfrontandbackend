package com.ompt.Ompt.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class HospitalResponse {

    private Long id;
    private String name;
    private boolean active;

}
