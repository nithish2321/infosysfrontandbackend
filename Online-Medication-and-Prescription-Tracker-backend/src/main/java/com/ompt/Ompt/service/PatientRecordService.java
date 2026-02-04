package com.ompt.Ompt.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.ompt.Ompt.DTO.AssignMedicineRequestDTO;
import com.ompt.Ompt.DTO.MedicineStatusUpdateDTO;
import com.ompt.Ompt.model.PatientRecord;
import com.ompt.Ompt.model.Role;
import com.ompt.Ompt.model.User;
import com.ompt.Ompt.repository.PatientRecordRepository;
import com.ompt.Ompt.repository.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
@AllArgsConstructor
public class PatientRecordService {

    private final PatientRecordRepository patientRecordRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    public JsonNode createForNewPatient(User patient, User assignedDoctor) {
        ObjectNode data = buildPatientTemplate(patient, assignedDoctor);

        PatientRecord record = new PatientRecord();
        record.setUser(patient);
        record.setAssignedDoctor(assignedDoctor);
        record.setDataJson(data.toString());
        patientRecordRepository.save(record);

        return data;
    }

    public JsonNode getOrCreateRecord(User patient) {
        PatientRecord record = patientRecordRepository
                .findByUser(patient)
                .orElseGet(() -> createEntityForPatient(patient, null));
        return parse(record.getDataJson());
    }

    public List<JsonNode> listByHospital(Long hospitalId) {
        return patientRecordRepository
                .findByUser_Hospital_Id(hospitalId)
                .stream()
                .map(record -> parse(record.getDataJson()))
                .toList();
    }

    public List<JsonNode> listByDoctor(User doctor) {
        return patientRecordRepository
                .findByAssignedDoctor(doctor)
                .stream()
                .map(record -> parse(record.getDataJson()))
                .toList();
    }

    public JsonNode updatePatientRecord(User patient, JsonNode updatedData) {
        PatientRecord record = patientRecordRepository
                .findByUser(patient)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Patient record not found"));

        ObjectNode normalized = updatedData.deepCopy();
        normalized.put("id", patient.getId());

        ObjectNode contact = normalized.with("contact");
        contact.put("email", patient.getEmail());

        if (record.getAssignedDoctor() != null) {
            normalized.put("doctorAssignedId", record.getAssignedDoctor().getId());
        } else {
            normalized.putNull("doctorAssignedId");
        }

        record.setDataJson(normalized.toString());
        patientRecordRepository.save(record);
        return normalized;
    }

    public JsonNode assignMedicine(User doctor, Long patientId, AssignMedicineRequestDTO request) {
        if (doctor.getRole() != Role.DOCTOR) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only doctor can assign medicines");
        }

        User patientUser = userRepository.findById(patientId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Patient not found"));

        PatientRecord record = patientRecordRepository
                .findByUser(patientUser)
                .orElseGet(() -> createEntityForPatient(patientUser, doctor));

        ObjectNode data = parseObject(record.getDataJson());
        ArrayNode medicines = data.withArray("medicines");

        ObjectNode medicine = objectMapper.createObjectNode();
        medicine.put("id", UUID.randomUUID().toString());
        medicine.put("name", request.getName());
        medicine.put("dosage", request.getDosage() == null ? "" : request.getDosage());
        medicine.put("type", request.getType() == null ? "Tablet" : request.getType());
        medicine.put("instructions", request.getInstructions() == null ? "As advised" : request.getInstructions());
        medicine.put("deliveryStatus", "pending");
        medicine.put("prescribedAt", LocalDateTime.now().toString());

        ArrayNode schedule = medicine.putArray("schedule");
        for (String time : request.getScheduleTimes()) {
            ObjectNode slot = schedule.addObject();
            slot.put("time", time);
            slot.put("status", "pending");
            slot.putNull("takenAt");
        }

        medicines.add(medicine);

        data.put("doctorAssignedId", doctor.getId());
        record.setAssignedDoctor(doctor);
        record.setDataJson(data.toString());
        patientRecordRepository.save(record);

        return data;
    }

    public JsonNode updateMedicineStatus(User patient, MedicineStatusUpdateDTO request) {
        PatientRecord record = patientRecordRepository
                .findByUser(patient)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Patient record not found"));

        ObjectNode data = parseObject(record.getDataJson());
        ArrayNode medicines = data.withArray("medicines");
        String status = request.getStatus();

        for (JsonNode medNode : medicines) {
            if (!medNode.path("id").asText().equals(request.getMedicineId())) {
                continue;
            }
            ArrayNode schedule = ((ObjectNode) medNode).withArray("schedule");
            for (JsonNode slotNode : schedule) {
                if (!slotNode.path("time").asText().equals(request.getTime())) {
                    continue;
                }
                ObjectNode slot = (ObjectNode) slotNode;
                slot.put("status", status);
                if (request.getReason() != null) {
                    slot.put("reason", request.getReason());
                }
                if (!"missed".equalsIgnoreCase(status)) {
                    slot.put("takenAt", LocalTime.now().format(DateTimeFormatter.ofPattern("HH:mm")));
                } else {
                    slot.putNull("takenAt");
                }
            }
        }

        record.setDataJson(data.toString());
        patientRecordRepository.save(record);
        return data;
    }

    public JsonNode updateDeliveryStatus(User patient, String medicineId, String status) {
        PatientRecord record = patientRecordRepository
                .findByUser(patient)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Patient record not found"));

        ObjectNode data = parseObject(record.getDataJson());
        ArrayNode medicines = data.withArray("medicines");

        for (JsonNode medNode : medicines) {
            if (!medNode.path("id").asText().equals(medicineId)) {
                continue;
            }
            ((ObjectNode) medNode).put("deliveryStatus", status);
        }

        record.setDataJson(data.toString());
        patientRecordRepository.save(record);
        return data;
    }

    private PatientRecord createEntityForPatient(User patient, User doctor) {
        PatientRecord record = new PatientRecord();
        record.setUser(patient);
        record.setAssignedDoctor(doctor);
        record.setDataJson(buildPatientTemplate(patient, doctor).toString());
        return patientRecordRepository.save(record);
    }

    private ObjectNode buildPatientTemplate(User patient, User doctor) {
        ObjectNode root = objectMapper.createObjectNode();
        root.put("id", patient.getId());
        root.put("name", patient.getName());
        root.put("age", 0);
        root.put("gender", "N/A");
        root.put("bloodGroup", "N/A");

        ObjectNode contact = root.putObject("contact");
        contact.put("phone", "");
        contact.put("email", patient.getEmail());
        contact.put("address", "");

        if (doctor != null) {
            root.put("doctorAssignedId", doctor.getId());
        } else {
            root.putNull("doctorAssignedId");
        }

        ObjectNode history = root.putObject("history");
        history.put("diagnosis", "New Patient");
        history.putArray("allergies");
        history.putArray("surgeries");
        ObjectNode vitals = history.putObject("vitals");
        vitals.put("bp", "");
        vitals.put("heartRate", "");
        vitals.put("weight", "");
        vitals.put("height", "");

        root.putArray("medicines");
        return root;
    }

    private JsonNode parse(String json) {
        try {
            return objectMapper.readTree(json);
        } catch (Exception ex) {
            return objectMapper.createObjectNode();
        }
    }

    private ObjectNode parseObject(String json) {
        JsonNode node = parse(json);
        if (node instanceof ObjectNode objectNode) {
            return objectNode;
        }
        return objectMapper.createObjectNode();
    }
}
