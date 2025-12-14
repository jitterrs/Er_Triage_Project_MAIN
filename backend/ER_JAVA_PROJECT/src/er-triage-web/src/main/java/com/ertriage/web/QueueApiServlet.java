package com.ertriage.web;

import com.ertriage.dao.PatientDAO;
import com.ertriage.dto.PatientView;
import com.ertriage.dto.WaitingRoomView;
import com.ertriage.service.QueueService;
import com.google.gson.Gson;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;

@WebServlet("/api/queue/*")
public class QueueApiServlet extends HttpServlet {

    private transient Gson gson;
    private transient QueueService queueService;

    @Override
    public void init() {
        this.gson = new Gson();
        this.queueService = new QueueService(new PatientDAO());
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String path = req.getPathInfo(); // null, "/", "/public"

        resp.setContentType("application/json;charset=UTF-8");

        // /api/queue/public
        if ("/public".equals(path)) {
            List<WaitingRoomView> list = queueService.listWaitingForDisplay();
            resp.getWriter().write(gson.toJson(list));
            return;
        }

        // /api/queue  (same as waiting queue)
        int page = parseIntOrDefault(req.getParameter("page"), 0);
        int size = parseIntOrDefault(req.getParameter("size"), 20);
        String nameFilter = req.getParameter("name");

        List<PatientView> list = queueService.listWaiting(page, size, nameFilter);
        resp.getWriter().write(gson.toJson(list));
    }

    private int parseIntOrDefault(String s, int def) {
        if (s == null || s.isEmpty()) return def;
        try { return Integer.parseInt(s); } catch (Exception e) { return def; }
    }
}
