package com.ertriage.web;

import com.ertriage.dao.PatientDAO;
import com.ertriage.web.MetricsController;
import com.ertriage.service.QueueService;
import com.google.gson.Gson;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Map;

@WebServlet("/api/metrics/triage")
public class MetricsApiServlet extends HttpServlet {

    private transient Gson gson;
    private transient MetricsController metricsController;

    @Override
    public void init() throws ServletException {
        super.init();

        PatientDAO patientDAO = new PatientDAO();
        QueueService queueService = new QueueService(patientDAO);
        this.metricsController = new MetricsController(queueService);
        this.gson = new Gson();
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        try {
            Map<String, Long> counts = metricsController.getTriageCounts();
            resp.setStatus(HttpServletResponse.SC_OK);
            resp.setContentType("application/json;charset=UTF-8");
            resp.getWriter().write(gson.toJson(counts));
        } catch (Exception ex) {
            ex.printStackTrace();
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            resp.setContentType("application/json;charset=UTF-8");
            resp.getWriter().write(gson.toJson(new ApiError("Server error")));
        }
    }
}
