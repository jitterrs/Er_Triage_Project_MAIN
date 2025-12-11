package com.ertriage.web;

import com.ertriage.dto.PatientView;
import com.ertriage.service.PatientService;
import com.google.gson.Gson;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;
import java.io.IOException;

@WebServlet("/api/patient/*")
public class PatientServlet extends HttpServlet {

    private PatientService patientService;
    private Gson gson = new Gson();

    @Override
    public void init() throws ServletException {
        // Build service the same way your MainDemo does
        this.patientService = ServiceFactory.createPatientService();
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {

        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");

        // Extract ID from URL: /api/patient/5
        String path = req.getPathInfo(); // "/5"
        if (path == null || path.equals("/")) {
            resp.setStatus(400);
            resp.getWriter().write("{\"error\":\"Patient ID required\"}");
            return;
        }

        long id = Long.parseLong(path.substring(1));

        PatientView patient = patientService.getPatient(id);

        if (patient == null) {
            resp.setStatus(404);
            resp.getWriter().write("{\"error\":\"Not Found\"}");
            return;
        }

        String json = gson.toJson(patient);
        resp.getWriter().write(json);
    }
}
