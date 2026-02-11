package com.ompt.Ompt.service;

import com.ompt.Ompt.DTO.*;
import com.ompt.Ompt.Util.JwtUtil;
import com.ompt.Ompt.model.Delivery;
import com.ompt.Ompt.model.InventoryItem;
import com.ompt.Ompt.model.Pharmacy;
import com.ompt.Ompt.repository.DeliveryRepository;
import com.ompt.Ompt.repository.InventoryItemRepository;
import com.ompt.Ompt.repository.PharmacyRepository;
import com.ompt.Ompt.repository.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@AllArgsConstructor
public class PharmacyService {

    private final PharmacyRepository pharmacyRepository;
    private final InventoryItemRepository inventoryItemRepository;
    private final DeliveryRepository deliveryRepository;
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public PharmacyProfileDTO register(PharmacyRegisterRequestDTO request) {
        String email = request.getEmail().toLowerCase();

        if (pharmacyRepository.existsByEmailIgnoreCase(email)
                || userRepository.existsByEmailIgnoreCase(email)) {
            throw new IllegalArgumentException("Email already registered");
        }

        Pharmacy pharmacy = new Pharmacy();
        pharmacy.setPharmacyName(request.getPharmacyName());
        pharmacy.setLocation(request.getLocation());
        pharmacy.setEmail(email);
        pharmacy.setPassword(passwordEncoder.encode(request.getPassword()));

        Pharmacy saved = pharmacyRepository.save(pharmacy);
        return toProfile(saved);
    }

    public PharmacyAuthResponseDTO login(PharmacyLoginRequestDTO request) {
        Pharmacy pharmacy = pharmacyRepository
                .findByEmailIgnoreCase(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Invalid Credentials"));

        if (!passwordEncoder.matches(request.getPassword(), pharmacy.getPassword())) {
            throw new BadCredentialsException("Invalid Credentials");
        }

        String token = jwtUtil.generateToken(pharmacy.getEmail(), "PHARMACY");
        return new PharmacyAuthResponseDTO(token, toProfile(pharmacy));
    }

    public PharmacyProfileDTO getProfile(String email) {
        Pharmacy pharmacy = getPharmacyByEmail(email);
        return toProfile(pharmacy);
    }

    public PharmacyProfileDTO updateProfile(String email, PharmacyProfileUpdateDTO request) {
        Pharmacy pharmacy = getPharmacyByEmail(email);
        String newEmail = request.getEmail().toLowerCase();

        if (!newEmail.equals(pharmacy.getEmail())) {
            if (pharmacyRepository.existsByEmailIgnoreCase(newEmail)
                    || userRepository.existsByEmailIgnoreCase(newEmail)) {
                throw new IllegalArgumentException("Email already registered");
            }
            pharmacy.setEmail(newEmail);
        }

        pharmacy.setPharmacyName(request.getPharmacyName());
        pharmacy.setLocation(request.getLocation());

        Pharmacy saved = pharmacyRepository.save(pharmacy);
        return toProfile(saved);
    }

    public List<InventoryItemResponseDTO> listInventory(String email) {
        Pharmacy pharmacy = getPharmacyByEmail(email);
        return inventoryItemRepository
                .findByPharmacyOrderByIdDesc(pharmacy)
                .stream()
                .map(this::toInventoryResponse)
                .toList();
    }

    public List<PharmacyAvailabilityDTO> listAvailability(String medicineName) {
        if (medicineName == null || medicineName.isBlank()) {
            return List.of();
        }

        return inventoryItemRepository
                .findByNameIgnoreCaseAndQuantityGreaterThan(medicineName.trim(), 0)
                .stream()
                .map(item -> new PharmacyAvailabilityDTO(
                        item.getId(),
                        item.getName(),
                        item.getDosage(),
                        item.getQuantity(),
                        item.getPrice(),
                        item.getPharmacy().getId(),
                        item.getPharmacy().getPharmacyName(),
                        item.getPharmacy().getLocation()
                ))
                .toList();
    }

    public InventoryItemResponseDTO createInventoryItem(String email, InventoryItemRequestDTO request) {
        Pharmacy pharmacy = getPharmacyByEmail(email);

        InventoryItem item = new InventoryItem();
        item.setPharmacy(pharmacy);
        item.setName(request.getName());
        item.setDosage(request.getDosage());
        item.setQuantity(request.getQuantity());
        item.setPrice(request.getPrice());
        item.setExpiry(request.getExpiry());
        item.setLowStock(isLowStock(request.getQuantity()));

        InventoryItem saved = inventoryItemRepository.save(item);
        return toInventoryResponse(saved);
    }

    public InventoryItemResponseDTO updateInventoryItem(String email, Long id, InventoryItemRequestDTO request) {
        Pharmacy pharmacy = getPharmacyByEmail(email);
        InventoryItem item = inventoryItemRepository
                .findByIdAndPharmacy(id, pharmacy)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Item not found"));

        item.setName(request.getName());
        item.setDosage(request.getDosage());
        item.setQuantity(request.getQuantity());
        item.setPrice(request.getPrice());
        item.setExpiry(request.getExpiry());
        item.setLowStock(isLowStock(request.getQuantity()));

        InventoryItem saved = inventoryItemRepository.save(item);
        return toInventoryResponse(saved);
    }

    public void deleteInventoryItem(String email, Long id) {
        Pharmacy pharmacy = getPharmacyByEmail(email);
        InventoryItem item = inventoryItemRepository
                .findByIdAndPharmacy(id, pharmacy)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Item not found"));

        inventoryItemRepository.delete(item);
    }

    public List<DeliveryResponseDTO> listDeliveries(String email) {
        Pharmacy pharmacy = getPharmacyByEmail(email);
        return deliveryRepository
                .findByPharmacyOrderByPrescribedAtDesc(pharmacy)
                .stream()
                .map(this::toDeliveryResponse)
                .toList();
    }

    public DeliveryResponseDTO createDelivery(String email, DeliveryRequestDTO request) {
        Pharmacy pharmacy = getPharmacyByEmail(email);

        Delivery delivery = new Delivery();
        delivery.setPharmacy(pharmacy);
        delivery.setPatientName(request.getPatient());
        delivery.setMedicineName(request.getMedicine());

        String status = request.getStatus();
        if (status == null || status.isBlank()) {
            status = "pending";
        }
        delivery.setStatus(status);
        delivery.setPrescribedAt(request.getDate());

        Delivery saved = deliveryRepository.save(delivery);
        return toDeliveryResponse(saved);
    }

    public DeliveryResponseDTO updateDeliveryStatus(String email, Long id, DeliveryStatusUpdateDTO request) {
        Pharmacy pharmacy = getPharmacyByEmail(email);
        Delivery delivery = deliveryRepository
                .findByIdAndPharmacy(id, pharmacy)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Delivery not found"));

        delivery.setStatus(request.getStatus());
        Delivery saved = deliveryRepository.save(delivery);
        return toDeliveryResponse(saved);
    }

    private Pharmacy getPharmacyByEmail(String email) {
        return pharmacyRepository
                .findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pharmacy not found"));
    }

    private boolean isLowStock(Integer quantity) {
        return quantity != null && quantity < 50;
    }

    private PharmacyProfileDTO toProfile(Pharmacy pharmacy) {
        return new PharmacyProfileDTO(
                pharmacy.getId(),
                pharmacy.getPharmacyName(),
                pharmacy.getLocation(),
                pharmacy.getEmail()
        );
    }

    private InventoryItemResponseDTO toInventoryResponse(InventoryItem item) {
        return new InventoryItemResponseDTO(
                item.getId(),
                item.getName(),
                item.getDosage(),
                item.getQuantity(),
                item.getPrice(),
                item.getExpiry(),
                item.isLowStock()
        );
    }

    private DeliveryResponseDTO toDeliveryResponse(Delivery delivery) {
        return new DeliveryResponseDTO(
                delivery.getId(),
                delivery.getPatientName(),
                delivery.getMedicineName(),
                delivery.getStatus(),
                delivery.getPrescribedAt()
        );
    }
}
