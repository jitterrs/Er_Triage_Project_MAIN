package com.ertriage.web;

import com.ertriage.dto.LoginRequest;
import com.ertriage.model.Nurse;
import com.ertriage.service.AuthService;

public class LoginController {

    private final AuthService authService;

    public LoginController(AuthService authService) {
        this.authService = authService;
    }

    public Nurse login(LoginRequest request) {
        if (request == null) return null;
        return authService.login(request.getUsername(), request.getPassword());
    }
}
