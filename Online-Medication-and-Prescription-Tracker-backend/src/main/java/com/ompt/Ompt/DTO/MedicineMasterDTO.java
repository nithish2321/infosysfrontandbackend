package com.ompt.Ompt.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class MedicineMasterDTO {
    private Long id;
    private String name;
    private String strength;
    private String type;
    private List<String> defaultSchedule;
}
