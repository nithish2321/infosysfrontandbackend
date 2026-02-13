package com.ompt.Ompt.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.ompt.Ompt.model.DoctorProfile;
import com.ompt.Ompt.model.Hospital;
import com.ompt.Ompt.model.AccountStatus;
import com.ompt.Ompt.model.Role;
import com.ompt.Ompt.model.User;
import com.ompt.Ompt.repository.DoctorProfileRepository;
import com.ompt.Ompt.repository.HospitalRepository;
import com.ompt.Ompt.repository.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@AllArgsConstructor
public class DoctorProfileService {

    private final DoctorProfileRepository doctorProfileRepository;
    private final UserRepository userRepository;
    private final HospitalRepository hospitalRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final ObjectMapper objectMapper;

    public JsonNode getTemplate() {
        return buildDoctorTemplate(null, "", "");
    }

    public JsonNode getOrCreateProfile(User doctor) {
        DoctorProfile profile = doctorProfileRepository
                .findByUser(doctor)
                .orElseGet(() -> createProfile(doctor, buildDoctorTemplate(doctor.getId(), doctor.getName(), doctor.getEmail())));
        ObjectNode data = parseObject(profile.getProfileJson());
        Hospital hospital = resolveHospital(doctor);
        if (hospital != null) {
            data.put("hospitalId", hospital.getId());
            data.put("hospitalName", hospital.getName());
        } else {
            data.putNull("hospitalId");
            data.putNull("hospitalName");
        }
        return data;
    }

    public List<JsonNode> listProfilesByHospital(Hospital hospital) {
        return doctorProfileRepository
                .findByUser_Hospital_Id(hospital.getId())
                .stream()
                .map(profile -> getOrCreateProfile(profile.getUser()))
                .toList();
    }

    public List<JsonNode> listAllDoctors() {
        return userRepository.findAll()
                .stream()
                .filter(user -> user.getRole() == Role.DOCTOR)
                .map(this::getOrCreateProfile)
                .toList();
    }

    public JsonNode createDoctorFromProfile(User admin, JsonNode profileJson) {
        if (admin.getRole() != Role.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admin can register doctors");
        }

        String name = profileJson.at("/personal/fullName").asText(null);
        String email = profileJson.at("/personal/email").asText(null);

        if (name == null || name.isBlank() || email == null || email.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Doctor name and email are required");
        }

        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Doctor email already exists");
        }

        User doctor = new User();
        doctor.setName(name);
        doctor.setStatus(AccountStatus.PENDING);
        doctor.setEmail(email.toLowerCase());
        doctor.setPassword(null);
        doctor.setRole(Role.DOCTOR);
        doctor.setHospital(admin.getHospital());

        String token = UUID.randomUUID().toString();
        doctor.setResetTokenHash(passwordEncoder.encode(token));
        doctor.setResetTokenExpiry(LocalDateTime.now().plusHours(24));

        userRepository.save(doctor);

        emailService.sendDoctorWelcomeMail(
                doctor.getEmail(),
                admin.getHospital().getName(),
                token
        );

        ObjectNode normalized = normalizeProfile(profileJson, doctor);
        createProfile(doctor, normalized);

        return normalized;
    }

    public JsonNode updateProfile(User admin, Long doctorId, JsonNode profileJson) {
        if (admin.getRole() != Role.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admin can update doctors");
        }

        User doctor = userRepository.findById(doctorId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Doctor not found"));

        if (doctor.getRole() != Role.DOCTOR || !doctor.getHospital().getId().equals(admin.getHospital().getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Doctor not in your hospital");
        }

        ObjectNode normalized = normalizeProfile(profileJson, doctor);
        DoctorProfile profile = doctorProfileRepository.findByUser(doctor).orElse(new DoctorProfile());
        profile.setUser(doctor);
        profile.setProfileJson(normalized.toString());
        doctorProfileRepository.save(profile);

        return normalized;
    }

    public JsonNode getOwnProfile(User doctor) {
        if (doctor.getRole() != Role.DOCTOR) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only doctor can access doctor profile");
        }
        return getOrCreateProfile(doctor);
    }

    public JsonNode updateOwnProfile(User doctor, JsonNode profileJson) {
        if (doctor.getRole() != Role.DOCTOR) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only doctor can update doctor profile");
        }

        ObjectNode incoming = profileJson != null && profileJson.isObject()
                ? (ObjectNode) profileJson.deepCopy()
                : objectMapper.createObjectNode();
        // Keep login identity stable for doctor self-service updates.
        incoming.with("personal").put("email", doctor.getEmail());

        ObjectNode normalized = normalizeProfile(incoming, doctor);
        DoctorProfile profile = doctorProfileRepository.findByUser(doctor).orElse(new DoctorProfile());
        profile.setUser(doctor);
        profile.setProfileJson(normalized.toString());
        doctorProfileRepository.save(profile);
        return normalized;
    }

    private DoctorProfile createProfile(User doctor, ObjectNode data) {
        DoctorProfile profile = new DoctorProfile();
        profile.setUser(doctor);
        profile.setProfileJson(data.toString());
        return doctorProfileRepository.save(profile);
    }

    private ObjectNode normalizeProfile(JsonNode profileJson, User doctor) {
        ObjectNode normalized = profileJson.deepCopy();
        normalized.put("id", doctor.getId());
        Hospital hospital = resolveHospital(doctor);
        if (hospital != null) {
            normalized.put("hospitalId", hospital.getId());
            normalized.put("hospitalName", hospital.getName());
        } else {
            normalized.putNull("hospitalId");
            normalized.putNull("hospitalName");
        }

        ObjectNode personal = normalized.with("personal");
        String newName = personal.path("fullName").asText(doctor.getName());
        String newEmail = personal.path("email").asText(doctor.getEmail());

        if (!doctor.getEmail().equalsIgnoreCase(newEmail)) {
            if (userRepository.existsByEmailIgnoreCase(newEmail)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered");
            }
            doctor.setEmail(newEmail.toLowerCase());
        }

        doctor.setName(newName);
        userRepository.save(doctor);

        personal.put("fullName", doctor.getName());
        personal.put("email", doctor.getEmail());
        return normalized;
    }

    private Hospital resolveHospital(User doctor) {
        if (doctor == null || doctor.getHospital() == null) {
            return null;
        }
        Long hospitalId = doctor.getHospital().getId();
        if (hospitalId == null) {
            return null;
        }
        return hospitalRepository.findById(hospitalId).orElse(null);
    }

    private JsonNode parse(String json) {
        try {
            return objectMapper.readTree(json);
        } catch (Exception ex) {
            return buildDoctorTemplate(null, "", "");
        }
    }

    private ObjectNode buildDoctorTemplate(Long id, String name, String email) {
        ObjectNode root = objectMapper.createObjectNode();
        if (id != null) {
            root.put("id", id);
        } else {
            root.putNull("id");
        }
        root.putNull("hospitalId");
        root.putNull("hospitalName");

        ObjectNode personal = root.putObject("personal");
        personal.put("fullName", name == null ? "" : name);
        personal.put("employeeId", "");
        personal.put("dob", "");
        personal.put("gender", "");
        personal.put("phone", "");
        personal.put("email", email == null ? "" : email);
        personal.put("address", "");
        personal.put("emergencyContact", "");

        ObjectNode qualifications = root.putObject("qualifications");
        qualifications.put("degrees", "");
        qualifications.put("specialization", "");
        qualifications.put("university", "");
        qualifications.put("yearOfGraduation", "");
        qualifications.put("registrationNumber", "");

        ObjectNode employment = root.putObject("employment");
        employment.put("department", "");
        employment.put("designation", "");
        employment.put("type", "Full-time");
        employment.put("dateOfJoining", "");
        employment.put("experience", "");
        employment.put("reportingManager", "");

        ObjectNode licensing = root.putObject("licensing");
        licensing.put("licenseNumber", "");
        licensing.put("validUntil", "");
        licensing.put("certifications", "");
        licensing.put("malpracticeInsurance", "");

        ObjectNode schedule = root.putObject("schedule");
        schedule.put("opdTimings", "");
        schedule.put("dutyShifts", "");
        schedule.put("leaveRecords", "0");
        schedule.put("onCall", "No");

        ObjectNode clinical = root.putObject("clinical");
        clinical.put("areasOfExpertise", "");
        clinical.put("procedures", "");
        clinical.put("surgeriesConducted", 0);
        clinical.put("consultationCount", 0);

        ObjectNode performance = root.putObject("performance");
        performance.put("rating", 0);
        performance.put("ratingCount", 0);
        performance.put("ratingTotal", 0);
        performance.put("peerReviews", "");
        performance.put("trainingParticipation", "");

        ObjectNode financial = root.putObject("financial");
        financial.put("salaryStructure", "");
        financial.put("bankAccount", "");
        financial.put("taxInfo", "");

        ObjectNode digital = root.putObject("digital");
        digital.put("systemLogin", "");
        digital.put("accessLevel", "Doctor");
        ArrayNode auditLogs = digital.putArray("auditLogs");
        auditLogs.removeAll();

        ObjectNode legal = root.putObject("legal");
        legal.put("contracts", "Signed");
        legal.put("ndaStatus", "Active");
        legal.put("disciplinaryActions", "None");

        ObjectNode research = root.putObject("research");
        research.put("publications", "");
        research.put("clinicalTrials", "");

        return root;
    }

    private ObjectNode parseObject(String json) {
        JsonNode node = parse(json);
        if (node instanceof ObjectNode objectNode) {
            return objectNode;
        }
        return objectMapper.createObjectNode();
    }
}
