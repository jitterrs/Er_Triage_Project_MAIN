package com.ertriage.service;

package com.ertriage.service;

import com.ertriage.dao.AuditLogDAO;
import com.ertriage.model.AuditLog;

import java.time.LocalDateTime;

import java.time.LocalDateTime;

public class AuditService {

    private final AuditLogDAO auditLogDAO;

    public AuditService(AuditLogDAO auditLogDAO) {
        this.auditLogDAO = auditLogDAO;
    }

    // 7.7.1 record()
    public void record(long patientId, String actor, String action, String detailsJson) {
        AuditLog log = new AuditLog();
        log.setPatientId(patientId);
        log.setActor(actor);
        log.setAction(action);
        log.setDetailsJson(detailsJson);
        log.setCreatedAt(LocalDateTime.now());
        auditLogDAO.save(log);
    }
}
