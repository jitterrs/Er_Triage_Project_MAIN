package com.ertriage;

import com.ertriage.dao.AuditLogDAO;
import com.ertriage.dao.PatientDAO;
import com.ertriage.dto.ChangeStatusRequest;
import com.ertriage.dto.CreatePatientRequest;
import com.ertriage.dto.PatientView;
import com.ertriage.dto.UpdateVitalsRequest;
import com.ertriage.model.Status;
import com.ertriage.model.AuditLog;
import com.ertriage.service.*;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.List;
import java.util.Map;

public class MainDemo {

    private static final String URL  = "jdbc:mysql://localhost:3306/er_triage_db";
    private static final String USER = "root";        // CHANGE IF NEEDED
    private static final String PASS = "Yaznbash2002@"; // CHANGE IF NEEDED

    public static void main(String[] args) {

        System.out.println("===== ER TRIAGE END-TO-END TEST =====");

        if (!testConnection()) {
            System.out.println("Stopping: DB connection failed.");
            return;
        }

        PatientDAO patientDAO = new PatientDAO();
        AuditLogDAO auditLogDAO = new AuditLogDAO();
        TriageService triageService = new TriageService();
        AuditService auditService = new AuditService(auditLogDAO);
        ValidationService validationService = new ValidationService();
        QueueService queueService = new QueueService(patientDAO);
        PatientService patientService = new PatientService(patientDAO, triageService, auditService);

        try {
            System.out.println("\n--- Creating patients ---");
            PatientView p1 = createTestPatient(patientService, validationService,
                    "Sara Test", 25, "F", "Headache and nausea");
            PatientView p2 = createTestPatient(patientService, validationService,
                    "Ali Test", 30, "M", "Abdominal pain");

            System.out.println("Created patient 1 id = " + p1.id);
            System.out.println("Created patient 2 id = " + p2.id);

            System.out.println("\n--- Updating vitals of patient 1 ---");
            UpdateVitalsRequest vitalsReq = new UpdateVitalsRequest();
            vitalsReq.bpSys = 150;
            vitalsReq.bpDia = 95;
            vitalsReq.hr = 110;
            vitalsReq.rr = 22;
            vitalsReq.spo2 = 92;
            vitalsReq.temp = 38.5;

            PatientView p1AfterVitals = patientService.updateVitals(p1.id, vitalsReq);
            System.out.println("Patient 1 new triage level = " + p1AfterVitals.triageLevel);

            System.out.println("\n--- Changing status of patient 1 to IN_TREATMENT ---");
            ChangeStatusRequest statusReq = new ChangeStatusRequest();
            statusReq.newStatus = Status.IN_TREATMENT;

            PatientView p1AfterStatus = patientService.changeStatus(p1.id, statusReq);
            System.out.println("Patient 1 new status = " + p1AfterStatus.status);

            System.out.println("\n--- Loading patients from DB ---");
            PatientView loaded1 = patientService.getPatient(p1.id);
            PatientView loaded2 = patientService.getPatient(p2.id);

            System.out.println("Loaded1: id=" + loaded1.id + ", name=" + loaded1.name);
            System.out.println("Loaded2: id=" + loaded2.id + ", name=" + loaded2.name);

            System.out.println("\n--- QueueService.listWaiting ---");
            List<PatientView> waiting = queueService.listWaiting(0, 10, null);
            for (PatientView v : waiting) {
                System.out.println("Waiting: id=" + v.id + ", name=" + v.name);
            }

            System.out.println("\n--- QueueService.countsByLevel ---");
            Map<String, Long> counts = queueService.countsByLevel();
            for (Map.Entry<String, Long> e : counts.entrySet()) {
                System.out.println("Level " + e.getKey() + " -> " + e.getValue());
            }

            System.out.println("\n--- AuditLog for patient 1 ---");
            List<AuditLog> logs = auditLogDAO.findByPatient(p1.id);
            for (AuditLog log : logs) {
                System.out.println(log.action + " at " + log.createdAt);
            }

            System.out.println("\n===== END-TO-END TEST SUCCESS =====");

        } catch (Exception e) {
            System.out.println("\n===== END-TO-END TEST FAILED =====");
            e.printStackTrace();
        }
    }

    private static PatientView createTestPatient(PatientService patientService,
                                                 ValidationService validationService,
                                                 String name, int age, String gender, String symptoms) {

        CreatePatientRequest req = new CreatePatientRequest();
        req.name = name;
        req.age = age;
        req.gender = gender;
        req.symptoms = symptoms;

        validationService.validateCreate(req);
        return patientService.createPatient(req);
    }

    private static boolean testConnection() {
        System.out.println("Trying to connect to MySQL...");
        try (Connection conn = DriverManager.getConnection(URL, USER, PASS)) {
            System.out.println("SUCCESS! Connected to database.");
            return true;
        } catch (SQLException e) {
            System.out.println("FAILED to connect!");
            e.printStackTrace();
            return false;
        }
    }
}