package com.ertriage.service;

import com.ertriage.dao.AuditLogDAO;
import com.ertriage.model.AuditLog;

import java.time.LocalDateTime;

public class AuditService {

    private final AuditLogDAO auditLogDAO;

    public AuditService(AuditLogDAO auditLogDAO) {
        this.auditLogDAO = auditLogDAO;
    }

    // 7.7.1 record()
    public void record(long patientId, String actor, String action, String detailsJson) {
        AuditLog log = new AuditLog();
        log.patientId = patientId;
        log.actor = actor;
        log.action = action;
        log.detailsJson = detailsJson;
        log.createdAt = LocalDateTime.now();
        auditLogDAO.save(log);
    }
}