package com.ompt.Ompt.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ompt.Ompt.model.MedicineMaster;
import com.ompt.Ompt.repository.MedicineMasterRepository;
import lombok.AllArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@AllArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final MedicineMasterRepository medicineMasterRepository;
    private final ObjectMapper objectMapper;

    @Override
    public void run(String... args) throws Exception {
        if (medicineMasterRepository.count() > 0) {
            return;
        }

        List<MedicineMaster> medicines = List.of(
                create("Metformin", "500mg", "Tablet", List.of("08:00", "20:00")),
                create("Amlodipine", "5mg", "Tablet", List.of("09:00")),
                create("Atorvastatin", "10mg", "Tablet", List.of("21:00")),
                create("Omeprazole", "20mg", "Capsule", List.of("07:00")),
                create("Amoxicillin", "500mg", "Capsule", List.of("08:00", "14:00", "20:00")),
                create("Ibuprofen", "400mg", "Tablet", List.of("10:00", "22:00")),
                create("Cetirizine", "10mg", "Tablet", List.of("21:00")),
                create("Insulin Glargine", "100IU", "Injection", List.of("22:00")),
                create("Salbutamol", "100mcg", "Inhaler", List.of("As needed")),
                create("Losartan", "50mg", "Tablet", List.of("08:00")),
                create("Aspirin", "75mg", "Tablet", List.of("13:00")),
                create("Clopidogrel", "75mg", "Tablet", List.of("13:00")),
                create("Levothyroxine", "50mcg", "Tablet", List.of("06:00")),
                create("Azithromycin", "500mg", "Tablet", List.of("10:00")),
                create("Pantoprazole", "40mg", "Tablet", List.of("07:00"))
        );

        medicineMasterRepository.saveAll(medicines);
    }

    private MedicineMaster create(String name, String strength, String type, List<String> schedule) throws Exception {
        MedicineMaster medicine = new MedicineMaster();
        medicine.setName(name);
        medicine.setStrength(strength);
        medicine.setType(type);
        medicine.setDefaultScheduleJson(objectMapper.writeValueAsString(schedule));
        return medicine;
    }
}
