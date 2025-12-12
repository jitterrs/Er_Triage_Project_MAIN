package com.ertriage.model;

import java.time.LocalDateTime;

public class AuditLog {
    public long id;
    public long patientId;
    public String actor;
    public String action;
    public String detailsJson;
    public LocalDateTime createdAt;
}