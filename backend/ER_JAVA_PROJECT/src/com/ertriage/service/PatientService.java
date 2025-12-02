package com.ertriage.service;

import com.ertriage.dao.PatientDAO;
import com.ertriage.dto.*;
import com.ertriage.model.*;

import java.util.Objects;

public class PatientService {

    private final PatientDAO patientDAO;
    private final TriageService triageService;
    private final AuditService auditService;

    public PatientService(PatientDAO patientDAO,
                          TriageService triageService,
                          AuditService auditService) {
        this.patientDAO = patientDAO;
        this.triageService = triageService;
        this.auditService = auditService;
    }

    // 7.3.1 createPatient()
    public PatientView createPatient(CreatePatientRequest req) {
        Patient patient = new Patient();
        patient.name = req.name;
        patient.age = req.age;
        patient.gender = req.gender;
        patient.symptoms = req.symptoms;
        patient.status = Status.WAITING;

        Vitals vitals = new Vitals();
        vitals.bpSys = req.bpSys;
        vitals.bpDia = req.bpDia;
        vitals.hr = req.hr;
        vitals.rr = req.rr;
        vitals.spo2 = req.spo2;
        vitals.temp = req.temp;
        patient.vitals = vitals;

        TriageResult result = triageService.evaluate(patient);
        patient.triageLevel = result.level;
        patient.triageScore = result.score;
        patient.redFlag = result.redFlag;
        patient.triageReason = result.reason;

        patientDAO.save(patient);
        auditService.record(patient.id, "SYSTEM", "CREATE_PATIENT", "Initial registration");

        return toView(patient);
    }

    // 7.3.2 updateVitals()
    public PatientView updateVitals(long patientId, UpdateVitalsRequest req) {
        Patient patient = patientDAO.findById(patientId);
        if (patient == null) {
            throw new IllegalArgumentException("Patient not found: " + patientId);
        }

        if (patient.vitals == null) {
            patient.vitals = new Vitals();
        }
        if (req.bpSys != null) patient.vitals.bpSys = req.bpSys;
        if (req.bpDia != null) patient.vitals.bpDia = req.bpDia;
        if (req.hr != null) patient.vitals.hr = req.hr;
        if (req.rr != null) patient.vitals.rr = req.rr;
        if (req.spo2 != null) patient.vitals.spo2 = req.spo2;
        if (req.temp != null) patient.vitals.temp = req.temp;

        TriageResult result = triageService.evaluate(patient);
        patient.triageLevel = result.level;
        patient.triageScore = result.score;
        patient.redFlag = result.redFlag;
        patient.triageReason = result.reason;

        patientDAO.update(patient);
        auditService.record(patientId, "SYSTEM", "UPDATE_VITALS", "Vitals updated");

        return toView(patient);
    }

    // 7.3.3 updateSymptoms()
    public PatientView updateSymptoms(long patientId, UpdateSymptomsRequest req) {
        Patient patient = patientDAO.findById(patientId);
        if (patient == null) {
            throw new IllegalArgumentException("Patient not found: " + patientId);
        }

        patient.symptoms = req.symptoms;

        TriageResult result = triageService.evaluate(patient);
        patient.triageLevel = result.level;
        patient.triageScore = result.score;
        patient.redFlag = result.redFlag;
        patient.triageReason = result.reason;

        patientDAO.update(patient);
        auditService.record(patientId, "SYSTEM", "UPDATE_SYMPTOMS", "Symptoms updated");

        return toView(patient);
    }

    // 7.3.4 changeStatus()
    public PatientView changeStatus(long patientId, ChangeStatusRequest req) {
        Patient patient = patientDAO.findById(patientId);
        if (patient == null) {
            throw new IllegalArgumentException("Patient not found: " + patientId);
        }

        Status oldStatus = patient.status;
        Status newStatus = Objects.requireNonNull(req.newStatus, "New status is required");
        patient.status = newStatus;

        patientDAO.update(patient);
        auditService.record(patientId, "SYSTEM", "CHANGE_STATUS",
                "From " + oldStatus + " to " + newStatus);

        return toView(patient);
    }

    // 7.3.5 getPatient()
    public PatientView getPatient(long id) {
        Patient patient = patientDAO.findById(id);
        if (patient == null) {
            throw new IllegalArgumentException("Patient not found: " + id);
        }
        return toView(patient);
    }

    private PatientView toView(Patient p) {
        PatientView v = new PatientView();
        v.id = p.id;
        v.name = p.name;
        v.age = p.age;
        v.gender = p.gender;
        v.symptoms = p.symptoms;

        if (p.vitals != null) {
            v.bpSys = p.vitals.bpSys;
            v.bpDia = p.vitals.bpDia;
            v.hr = p.vitals.hr;
            v.rr = p.vitals.rr;
            v.spo2 = p.vitals.spo2;
            v.temp = p.vitals.temp;
        }

        v.triageLevel = p.triageLevel;
        v.triageScore = p.triageScore;
        v.redFlag = p.redFlag;
        v.triageReason = p.triageReason;
        v.status = p.status;

        return v;
    }
}