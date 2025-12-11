package com.ertriage.web;

import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import com.ertriage.service.AuthService;
import com.ertriage.dao.NurseDAO;
import com.ertriage.dto.LoginRequest;
import com.ertriage.model.Nurse;
import com.ertriage.web.LoginController;

import java.io.IOException;

public class LoginServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {

        String username = req.getParameter("username");
        String password = req.getParameter("password");

        resp.setContentType("application/json");

        NurseDAO dao = new NurseDAO();               // your existing DAO (already handles DB)
        AuthService auth = new AuthService(dao);
        LoginController controller = new LoginController(auth);

        LoginRequest request = new LoginRequest();
        request.setUsername(username);
        request.setPassword(password);

        Nurse nurse = controller.login(request);

        if (nurse == null) {
            resp.getWriter().write("{\"success\": false, \"message\": \"Invalid login\"}");
        } else {
            resp.getWriter().write("{\"success\": true, \"username\": \"" + nurse.getUsername() + "\"}");
        }
    }
}
