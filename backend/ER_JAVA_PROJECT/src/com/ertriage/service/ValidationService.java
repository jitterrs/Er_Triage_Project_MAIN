package com.ertriage.service;

import com.ertriage.dto.CreatePatientRequest;
import com.ertriage.dto.UpdateVitalsRequest;
import com.ertriage.dto.UpdateSymptomsRequest;
import com.ertriage.model.Status;

public class ValidationService {

    // 7.6.1 validateCreate()
    public void validateCreate(CreatePatientRequest req) {
        if (req == null) {
            throw new IllegalArgumentException("Request cannot be null");
        }
        if (req.name == null || req.name.isBlank()) {
            throw new IllegalArgumentException("Name is required");
        }
        if (req.age <= 0) {
            throw new IllegalArgumentException("Age must be positive");
        }
    }

    // 7.6.2 validateUpdateVitals()
    public void validateUpdateVitals(UpdateVitalsRequest req) {
        // You can add range checks if you want; left empty for now.
    }

    // 7.6.3 validateUpdateSymptoms()
    public void validateUpdateSymptoms(UpdateSymptomsRequest req) {
        if (req == null || req.symptoms == null || req.symptoms.isBlank()) {
            throw new IllegalArgumentException("Symptoms cannot be empty");
        }
    }

    // 7.6.4 validateStatusChange()
    public void validateStatusChange(Status current, Status next) {
        if (current == Status.TREATED && next == Status.WAITING) {
            throw new IllegalArgumentException("Cannot move TREATED back to WAITING");
        }
    }
}