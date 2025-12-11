package com.ertriage.web;

import com.ertriage.dao.NurseDAO;
import com.ertriage.dto.LoginRequest;
import com.ertriage.model.Nurse;
import com.ertriage.service.AuthService;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.io.PrintWriter;

/**
 * Servlet that exposes login functionality at /api/login.
 * Expects POST form fields: username, password
 * Returns JSON: { success: boolean, message?: string, id?: number, username?: string }
 */
public class LoginServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {

        req.setCharacterEncoding("UTF-8");
        resp.setCharacterEncoding("UTF-8");
        resp.setContentType("application/json");

        String username = req.getParameter("username");
        String password = req.getParameter("password");

        try (PrintWriter out = resp.getWriter()) {

            if (username == null || password == null ||
                username.isBlank() || password.isBlank()) {

                resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                out.write("{\"success\":false,\"message\":\"Username and password are required\"}");
                return;
            }

            // NurseDAO handles the DB connection internally
            NurseDAO nurseDAO = new NurseDAO();
            AuthService authService = new AuthService(nurseDAO);
            LoginController loginController = new LoginController(authService);

            LoginRequest loginRequest = new LoginRequest();
            loginRequest.setUsername(username);
            loginRequest.setPassword(password);

            Nurse nurse = loginController.login(loginRequest);

            if (nurse == null) {
                resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                out.write("{\"success\":false,\"message\":\"Invalid credentials\"}");
            } else {
                String safeUsername = nurse.getUsername() == null
                        ? ""
                        : nurse.getUsername().replace("\"", "\\\"");
                String json = String.format(
                        "{\"success\":true,\"id\":%d,\"username\":\"%s\"}",
                        nurse.getId(),
                        safeUsername
                );
                resp.setStatus(HttpServletResponse.SC_OK);
                out.write(json);
            }
        } catch (Exception e) {
            e.printStackTrace();
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            resp.getWriter().write("{\"success\":false,\"message\":\"Server error\"}");
        }
    }
}
