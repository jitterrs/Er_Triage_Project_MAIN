package com.ertriage.dto;

public class LoginRequest {
    private String username;
    private String password;

    public LoginRequest() {}

    public String getUsername() { 
        return username; 
    }

    public String getPassword() { 
        return password; 
    }

    // Added setters so we can populate this DTO from the servlet
    public void setUsername(String username) { 
        this.username = username; 
    }

    public void setPassword(String password) { 
        this.password = password; 
    }
}
