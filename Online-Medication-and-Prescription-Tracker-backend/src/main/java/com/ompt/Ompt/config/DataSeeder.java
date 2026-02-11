package com.ompt.Ompt.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import com.ompt.Ompt.DTO.AssignMedicineRequestDTO;
import com.ompt.Ompt.model.*;
import com.ompt.Ompt.repository.MedicineMasterRepository;
import com.ompt.Ompt.repository.*;
import com.ompt.Ompt.service.DoctorProfileService;
import com.ompt.Ompt.service.PatientRecordService;
import lombok.AllArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Component
@AllArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final MedicineMasterRepository medicineMasterRepository;
    private final HospitalRepository hospitalRepository;
    private final UserRepository userRepository;
    private final PatientRecordRepository patientRecordRepository;
    private final UserProfileRepository userProfileRepository;
    private final PharmacyRepository pharmacyRepository;
    private final InventoryItemRepository inventoryItemRepository;
    private final DeliveryRepository deliveryRepository;
    private final DoctorProfileService doctorProfileService;
    private final PatientRecordService patientRecordService;
    private final BCryptPasswordEncoder passwordEncoder;
    private final ObjectMapper objectMapper;

    private static final String DEMO_PASSWORD = "Pass@1234";

    @Override
    public void run(String... args) throws Exception {
        seedMedicineMaster();
        seedDemoPharmacyData();
        seedDemoHospitalUsers();
    }

    private void seedMedicineMaster() throws Exception {
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

    private void seedDemoHospitalUsers() {
        Hospital hospital = hospitalRepository
                .findByNameIgnoreCase("OMPT Demo Hospital")
                .orElseGet(() -> {
                    Hospital newHospital = new Hospital();
                    newHospital.setName("OMPT Demo Hospital");
                    return hospitalRepository.save(newHospital);
                });

        User admin = upsertUser(
                "demo.admin@ompt.test",
                "Demo Admin",
                Role.ADMIN,
                hospital
        );

        User doctorA = upsertUser(
                "demo.doctor1@ompt.test",
                "Dr. Asha Menon",
                Role.DOCTOR,
                hospital
        );
        User doctorB = upsertUser(
                "demo.doctor2@ompt.test",
                "Dr. Ravi Iyer",
                Role.DOCTOR,
                hospital
        );

        doctorProfileService.getOrCreateProfile(doctorA);
        doctorProfileService.getOrCreateProfile(doctorB);

        User patientA = upsertUser(
                "demo.patient1@ompt.test",
                "Ananya Rao",
                Role.PATIENT,
                hospital
        );
        User patientB = upsertUser(
                "demo.patient2@ompt.test",
                "Kiran Patel",
                Role.PATIENT,
                hospital
        );

        ensurePatientProfile(patientA, "Ananya Rao", "Female", 34, "9876543210", "B+", "12 Lakeview Street");
        ensurePatientProfile(patientB, "Kiran Patel", "Male", 41, "9123456780", "O+", "88 Hillcrest Avenue");

        ensurePatientRecord(patientA, doctorA);
        ensurePatientRecord(patientB, doctorB);

        ensureDemoMedicines(doctorA, patientA);
        ensureDemoMedicines(doctorB, patientB);
    }

    private void seedDemoPharmacyData() {
        Pharmacy pharmacy = pharmacyRepository
                .findByEmailIgnoreCase("demo.pharmacy@ompt.test")
                .map(existing -> {
                    existing.setPharmacyName("OMPT Care Pharmacy");
                    existing.setLocation("2nd Floor, OMPT Demo Hospital");
                    existing.setPassword(passwordEncoder.encode(DEMO_PASSWORD));
                    return pharmacyRepository.save(existing);
                })
                .orElseGet(() -> {
                    Pharmacy newPharmacy = new Pharmacy();
                    newPharmacy.setPharmacyName("OMPT Care Pharmacy");
                    newPharmacy.setLocation("2nd Floor, OMPT Demo Hospital");
                    newPharmacy.setEmail("demo.pharmacy@ompt.test");
                    newPharmacy.setPassword(passwordEncoder.encode(DEMO_PASSWORD));
                    return pharmacyRepository.save(newPharmacy);
                });

        if (inventoryItemRepository.findByPharmacyOrderByIdDesc(pharmacy).isEmpty()) {
            InventoryItem itemA = new InventoryItem();
            itemA.setPharmacy(pharmacy);
            itemA.setName("Metformin");
            itemA.setDosage("500mg");
            itemA.setQuantity(180);
            itemA.setPrice(5.50);
            itemA.setExpiry(LocalDate.now().plusMonths(18));
            itemA.setLowStock(false);

            InventoryItem itemB = new InventoryItem();
            itemB.setPharmacy(pharmacy);
            itemB.setName("Amlodipine");
            itemB.setDosage("5mg");
            itemB.setQuantity(75);
            itemB.setPrice(4.75);
            itemB.setExpiry(LocalDate.now().plusMonths(14));
            itemB.setLowStock(false);

            InventoryItem itemC = new InventoryItem();
            itemC.setPharmacy(pharmacy);
            itemC.setName("Insulin Glargine");
            itemC.setDosage("100IU");
            itemC.setQuantity(20);
            itemC.setPrice(22.00);
            itemC.setExpiry(LocalDate.now().plusMonths(10));
            itemC.setLowStock(true);

            inventoryItemRepository.saveAll(List.of(itemA, itemB, itemC));
        }

        if (deliveryRepository.findByPharmacyOrderByPrescribedAtDesc(pharmacy).isEmpty()) {
            Delivery deliveryA = new Delivery();
            deliveryA.setPharmacy(pharmacy);
            deliveryA.setPatientName("Ananya Rao");
            deliveryA.setMedicineName("Metformin 500mg");
            deliveryA.setStatus("pending");
            deliveryA.setPrescribedAt(LocalDateTime.now().minusDays(1));

            Delivery deliveryB = new Delivery();
            deliveryB.setPharmacy(pharmacy);
            deliveryB.setPatientName("Kiran Patel");
            deliveryB.setMedicineName("Amlodipine 5mg");
            deliveryB.setStatus("delivered");
            deliveryB.setPrescribedAt(LocalDateTime.now().minusDays(2));

            deliveryRepository.saveAll(List.of(deliveryA, deliveryB));
        }
    }

    private User upsertUser(String email, String name, Role role, Hospital hospital) {
        return userRepository.findByEmailIgnoreCase(email)
                .map(existing -> {
                    existing.setName(name);
                    existing.setRole(role);
                    existing.setStatus(AccountStatus.ACTIVE);
                    existing.setHospital(hospital);
                    existing.setPassword(passwordEncoder.encode(DEMO_PASSWORD));
                    return userRepository.save(existing);
                })
                .orElseGet(() -> {
                    User user = new User();
                    user.setName(name);
                    user.setEmail(email.toLowerCase());
                    user.setRole(role);
                    user.setStatus(AccountStatus.ACTIVE);
                    user.setHospital(hospital);
                    user.setPassword(passwordEncoder.encode(DEMO_PASSWORD));
                    return userRepository.save(user);
                });
    }

    private void ensurePatientRecord(User patient, User doctor) {
        if (patientRecordRepository.findByUser(patient).isEmpty()) {
            patientRecordService.createForNewPatient(patient, doctor);
        }
    }

    private void ensurePatientProfile(User patient, String name, String gender, int age, String phone, String bloodGroup, String address) {
        if (userProfileRepository.findByUser(patient).isPresent()) {
            return;
        }
        UserProfile profile = new UserProfile();
        profile.setUser(patient);
        profile.setPatientName(name);
        profile.setGender(gender);
        profile.setAge(age);
        profile.setPhoneNumber(phone);
        profile.setBloodGroup(bloodGroup);
        profile.setAddress(address);
        userProfileRepository.save(profile);
    }

    private void ensureDemoMedicines(User doctor, User patient) {
        JsonNode record = patientRecordService.getOrCreateRecord(patient);
        if (record.path("medicines").isArray() && record.path("medicines").size() > 0) {
            return;
        }

        Long metforminItemId = findInventoryItemId("Metformin");
        if (metforminItemId != null) {
            AssignMedicineRequestDTO metformin = new AssignMedicineRequestDTO(
                    "Metformin",
                    "500mg",
                    "Tablet",
                    "After meals",
                    metforminItemId,
                    List.of("08:00", "20:00")
            );
            patientRecordService.assignMedicine(doctor, patient.getId(), metformin);
        }

        Long amlodipineItemId = findInventoryItemId("Amlodipine");
        if (amlodipineItemId != null) {
            AssignMedicineRequestDTO amlodipine = new AssignMedicineRequestDTO(
                    "Amlodipine",
                    "5mg",
                    "Tablet",
                    "Once daily",
                    amlodipineItemId,
                    List.of("09:00")
            );
            patientRecordService.assignMedicine(doctor, patient.getId(), amlodipine);
        }
    }

    private MedicineMaster create(String name, String strength, String type, List<String> schedule) throws Exception {
        MedicineMaster medicine = new MedicineMaster();
        medicine.setName(name);
        medicine.setStrength(strength);
        medicine.setType(type);
        medicine.setDefaultScheduleJson(objectMapper.writeValueAsString(schedule));
        return medicine;
    }

    private Long findInventoryItemId(String name) {
        return inventoryItemRepository
                .findByNameIgnoreCaseAndQuantityGreaterThan(name, 0)
                .stream()
                .findFirst()
                .map(InventoryItem::getId)
                .orElse(null);
    }
}
