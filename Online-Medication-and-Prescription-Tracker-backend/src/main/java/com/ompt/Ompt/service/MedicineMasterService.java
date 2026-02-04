package com.ompt.Ompt.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ompt.Ompt.DTO.MedicineMasterDTO;
import com.ompt.Ompt.model.MedicineMaster;
import com.ompt.Ompt.repository.MedicineMasterRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class MedicineMasterService {

    private final MedicineMasterRepository medicineMasterRepository;
    private final ObjectMapper objectMapper;

    public List<MedicineMasterDTO> listAll() {
        return medicineMasterRepository.findAll()
                .stream()
                .map(this::toDto)
                .toList();
    }

    public MedicineMasterDTO toDto(MedicineMaster medicine) {
        List<String> schedule = parseSchedule(medicine.getDefaultScheduleJson());
        return new MedicineMasterDTO(
                medicine.getId(),
                medicine.getName(),
                medicine.getStrength(),
                medicine.getType(),
                schedule
        );
    }

    private List<String> parseSchedule(String json) {
        try {
            return objectMapper.readValue(json, new TypeReference<>() {});
        } catch (Exception ex) {
            return List.of();
        }
    }
}
