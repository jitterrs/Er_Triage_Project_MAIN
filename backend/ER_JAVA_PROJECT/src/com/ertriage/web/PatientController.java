package com.ertriage.web;

import com.ertriage.dto.*;
import com.ertriage.service.PatientService;
import com.ertriage.service.QueueService;
import com.ertriage.service.ValidationService;

import java.util.List;

public class PatientController {

    private final ValidationService validationService;
    private final PatientService patientService;
    private final QueueService queueService;

    public PatientController(ValidationService validationService,
                             PatientService patientService,
                             QueueService queueService) {
        this.validationService = validationService;
        this.patientService = patientService;
        this.queueService = queueService;
    }

    // 7.1.1 createPatient()
    public PatientView createPatient(CreatePatientRequest req) {
        validationService.validateCreate(req);
        return patientService.createPatient(req);
    }

    // 7.1.2 getPatient()
    public PatientView getPatient(long id) {
        return patientService.getPatient(id);
    }

    // 7.1.3 listWaiting()
    public List<PatientView> listWaiting(int page, int size, String nameFilter) {
        return queueService.listWaiting(page, size, nameFilter);
    }

    // 7.1.4 updateVitals()
    public PatientView updateVitals(long id, UpdateVitalsRequest req) {
        validationService.validateUpdateVitals(req);
        return patientService.updateVitals(id, req);
    }

    // 7.1.5 updateSymptoms()
    public PatientView updateSymptoms(long id, UpdateSymptomsRequest req) {
        validationService.validateUpdateSymptoms(req);
        return patientService.updateSymptoms(id, req);
    }

    // 7.1.6 changeStatus()
    public PatientView changeStatus(long id, ChangeStatusRequest req) {
        // Get current status first
        PatientView current = patientService.getPatient(id);

        // Validate transition (e.g. TREATED -> WAITING is not allowed)
        validationService.validateStatusChange(current.status, req.newStatus);

        // Then perform status change + audit
        return patientService.changeStatus(id, req);
    }

}