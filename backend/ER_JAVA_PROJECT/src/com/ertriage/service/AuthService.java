package com.ertriage.service;

import com.ertriage.dao.NurseDAO;
import com.ertriage.model.Nurse;

public class AuthService {

    private final NurseDAO nurseDAO;

    public AuthService(NurseDAO nurseDAO) {
        this.nurseDAO = nurseDAO;
    }

    public Nurse login(String username, String password) {
        return nurseDAO.authenticate(username, password);
    }
}
