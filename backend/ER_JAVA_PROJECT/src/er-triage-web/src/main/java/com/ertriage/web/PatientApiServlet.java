package com.ertriage.web;

import com.ertriage.dao.AuditLogDAO;
import com.ertriage.dao.PatientDAO;
import com.ertriage.dto.ChangeStatusRequest;
import com.ertriage.dto.CreatePatientRequest;
import com.ertriage.dto.PatientView;
import com.ertriage.dto.UpdateSymptomsRequest;
import com.ertriage.dto.UpdateVitalsRequest;
import com.ertriage.service.AuditService;
import com.ertriage.service.PatientService;
import com.ertriage.service.QueueService;
import com.ertriage.service.TriageService;
import com.ertriage.service.ValidationService;
import com.google.gson.Gson;
import com.google.gson.JsonSyntaxException;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.BufferedReader;
import java.io.IOException;
import java.util.List;

/**
 * REST-style API for patients.
 *
 *  POST /api/patients
 *      -> create patient from JSON, returns PatientView
 *
 *  GET /api/patients
 *      -> list waiting patients (for dashboard)
 *
 *  GET /api/patients/{id}
 *      -> get a single patient by id
 *
 *  POST /api/patients/{id}/status
 *      -> change status (IN_TREATMENT, TREATED, etc.)
 *
 *  POST /api/patients/{id}/vitals
 *      -> update vitals and re-triage
 *
 *  POST /api/patients/{id}/symptoms
 *      -> update symptoms and (optionally) re-triage
 */
@WebServlet("/api/patients/*")
public class PatientApiServlet extends HttpServlet {

    private transient Gson gson;
    private transient PatientController patientController;

    @Override
    public void init() throws ServletException {
        super.init();

        // Build backend graph (similar to MainDemo)
        PatientDAO patientDAO = new PatientDAO();
        AuditLogDAO auditLogDAO = new AuditLogDAO();

        AuditService auditService = new AuditService(auditLogDAO);
        TriageService triageService = new TriageService();
        ValidationService validationService = new ValidationService();
        QueueService queueService = new QueueService(patientDAO);
        PatientService patientService = new PatientService(patientDAO, triageService, auditService);

        this.patientController = new PatientController(validationService, patientService, queueService);
        this.gson = new Gson();
    }

    // ---------- small helpers ----------

    private <T> T readJson(HttpServletRequest req, Class<T> type) throws IOException {
        StringBuilder sb = new StringBuilder();
        try (BufferedReader br = req.getReader()) {
            String line;
            while ((line = br.readLine()) != null) {
                sb.append(line);
            }
        }
        String json = sb.toString().trim();
        if (json.isEmpty()) {
            return null;
        }
        return gson.fromJson(json, type);
    }

    private void writeJson(HttpServletResponse resp, int status, Object body) throws IOException {
        resp.setStatus(status);
        resp.setContentType("application/json;charset=UTF-8");
        resp.getWriter().write(gson.toJson(body));
    }

    private void writeError(HttpServletResponse resp, int status, String msg) throws IOException {
        writeJson(resp, status, new ApiError(msg));
    }

    private int parseIntOrDefault(String s, int def) {
        if (s == null || s.isEmpty()) return def;
        try {
            return Integer.parseInt(s);
        } catch (NumberFormatException e) {
            return def;
        }
    }

    private long parseId(String s) {
        return Long.parseLong(s);
    }

    // ========== GET: list & get by id ==========

   @Override
protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
    resp.setHeader("X-ERTRIAGE-BUILD", "IN_TREATMENT_ROUTE_OK");
    System.out.println("doGet /api/patients hit, path=" + req.getPathInfo());

    String path = req.getPathInfo();  // null, "/", "/{id}", or "/inTreatment"

    try {
        // ✅ Special route first
        if ("/inTreatment".equals(path)) {
            int page = parseIntOrDefault(req.getParameter("page"), 0);
            int size = parseIntOrDefault(req.getParameter("size"), 20);
            String nameFilter = req.getParameter("name");

            List<PatientView> list = patientController.listInTreatment(page, size, nameFilter);
            writeJson(resp, HttpServletResponse.SC_OK, list);
            return;
        }

        // Existing behavior: list waiting
        if (path == null || "/".equals(path)) {
            int page = parseIntOrDefault(req.getParameter("page"), 0);
            int size = parseIntOrDefault(req.getParameter("size"), 20);
            String nameFilter = req.getParameter("name");

            System.out.println("About to call listWaiting...");
            List<PatientView> list = patientController.listWaiting(page, size, nameFilter);
            System.out.println("Returned from listWaiting.");
            writeJson(resp, HttpServletResponse.SC_OK, list);
            return;
        }


        // Existing behavior: GET by id
        String[] parts = path.split("/");
        if (parts.length >= 2 && !parts[1].isEmpty()) {
            long id = parseId(parts[1]);
            PatientView view = patientController.getPatient(id);
            writeJson(resp, HttpServletResponse.SC_OK, view);
        } else {
            writeError(resp, HttpServletResponse.SC_NOT_FOUND, "Invalid patient path");
        }

    } catch (IllegalArgumentException ex) {
        writeError(resp, HttpServletResponse.SC_BAD_REQUEST, ex.getMessage());
    } catch (Exception ex) {
        ex.printStackTrace();
        writeError(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Server error");
    }
}


    // ========== POST: create & actions ==========

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String path = req.getPathInfo();  // "/", null, or "/{id}/something"

        try {
            if (path == null || "/".equals(path)) {
                // POST /api/patients -> create
                CreatePatientRequest body = readJson(req, CreatePatientRequest.class);
                if (body == null) {
                    writeError(resp, HttpServletResponse.SC_BAD_REQUEST, "Empty request body");
                    return;
                }
                PatientView created = patientController.createPatient(body);
                writeJson(resp, HttpServletResponse.SC_CREATED, created);
                return;
            }

            // Expect "/{id}/action"
            String[] parts = path.split("/");
            if (parts.length < 3 || parts[1].isEmpty()) {
                writeError(resp, HttpServletResponse.SC_NOT_FOUND, "Invalid patient action path");
                return;
            }

            long id = parseId(parts[1]);
            String action = parts[2];

            switch (action) {
                case "status": {
                    ChangeStatusRequest body = readJson(req, ChangeStatusRequest.class);
                    if (body == null) {
                        writeError(resp, HttpServletResponse.SC_BAD_REQUEST, "Empty status request");
                        return;
                    }
                    PatientView updated = patientController.changeStatus(id, body);
                    writeJson(resp, HttpServletResponse.SC_OK, updated);
                    break;
                }
                case "vitals": {
                    UpdateVitalsRequest body = readJson(req, UpdateVitalsRequest.class);
                    if (body == null) {
                        writeError(resp, HttpServletResponse.SC_BAD_REQUEST, "Empty vitals request");
                        return;
                    }
                    PatientView updated = patientController.updateVitals(id, body);
                    writeJson(resp, HttpServletResponse.SC_OK, updated);
                    break;
                }
                case "symptoms": {
                    UpdateSymptomsRequest body = readJson(req, UpdateSymptomsRequest.class);
                    if (body == null) {
                        writeError(resp, HttpServletResponse.SC_BAD_REQUEST, "Empty symptoms request");
                        return;
                    }
                    PatientView updated = patientController.updateSymptoms(id, body);
                    writeJson(resp, HttpServletResponse.SC_OK, updated);
                    break;
                }
                default:
                    writeError(resp, HttpServletResponse.SC_NOT_FOUND, "Unknown action: " + action);
            }

        } catch (JsonSyntaxException ex) {
            writeError(resp, HttpServletResponse.SC_BAD_REQUEST, "Invalid JSON: " + ex.getMessage());
        } catch (IllegalArgumentException ex) {
            writeError(resp, HttpServletResponse.SC_BAD_REQUEST, ex.getMessage());
        } catch (Exception ex) {
            ex.printStackTrace();
            writeError(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Server error");
        }
    }
}
