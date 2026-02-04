package com.ompt.Ompt.Controller;

import com.ompt.Ompt.DTO.*;
import com.ompt.Ompt.service.PharmacyService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pharmacy")
@AllArgsConstructor
public class PharmacyController {

    private final PharmacyService pharmacyService;

    @GetMapping("/profile")
    public ResponseEntity<PharmacyProfileDTO> getProfile(Authentication authentication) {
        return ResponseEntity.ok(pharmacyService.getProfile(authentication.getName()));
    }

    @PutMapping("/profile")
    public ResponseEntity<PharmacyProfileDTO> updateProfile(
            @Valid @RequestBody PharmacyProfileUpdateDTO request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(pharmacyService.updateProfile(authentication.getName(), request));
    }

    @GetMapping("/inventory")
    public ResponseEntity<List<InventoryItemResponseDTO>> listInventory(Authentication authentication) {
        return ResponseEntity.ok(pharmacyService.listInventory(authentication.getName()));
    }

    @PostMapping("/inventory")
    public ResponseEntity<InventoryItemResponseDTO> createInventoryItem(
            @Valid @RequestBody InventoryItemRequestDTO request,
            Authentication authentication
    ) {
        InventoryItemResponseDTO response =
                pharmacyService.createInventoryItem(authentication.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/inventory/{id}")
    public ResponseEntity<InventoryItemResponseDTO> updateInventoryItem(
            @PathVariable Long id,
            @Valid @RequestBody InventoryItemRequestDTO request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                pharmacyService.updateInventoryItem(authentication.getName(), id, request)
        );
    }

    @DeleteMapping("/inventory/{id}")
    public ResponseEntity<Void> deleteInventoryItem(
            @PathVariable Long id,
            Authentication authentication
    ) {
        pharmacyService.deleteInventoryItem(authentication.getName(), id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/deliveries")
    public ResponseEntity<List<DeliveryResponseDTO>> listDeliveries(Authentication authentication) {
        return ResponseEntity.ok(pharmacyService.listDeliveries(authentication.getName()));
    }

    @PostMapping("/deliveries")
    public ResponseEntity<DeliveryResponseDTO> createDelivery(
            @Valid @RequestBody DeliveryRequestDTO request,
            Authentication authentication
    ) {
        DeliveryResponseDTO response =
                pharmacyService.createDelivery(authentication.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PatchMapping("/deliveries/{id}")
    public ResponseEntity<DeliveryResponseDTO> updateDeliveryStatus(
            @PathVariable Long id,
            @Valid @RequestBody DeliveryStatusUpdateDTO request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                pharmacyService.updateDeliveryStatus(authentication.getName(), id, request)
        );
    }
}
