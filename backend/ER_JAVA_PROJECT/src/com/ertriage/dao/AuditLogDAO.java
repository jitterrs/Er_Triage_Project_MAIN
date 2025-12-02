package com.ertriage.dao;

import com.ertriage.model.AuditLog;

import java.util.ArrayList;
import java.util.List;

public class AuditLogDAO {

    public static List<AuditLog> logs = new ArrayList<>();
    public static long nextId = 1;

    // 7.9.1 save()
    public void save(AuditLog log) {
        log.id = nextId++;
        logs.add(log);
    }

    // 7.9.2 findByPatient()
    public List<AuditLog> findByPatient(long patientId) {
        List<AuditLog> result = new ArrayList<>();
        for (AuditLog log : logs) {
            if (log.patientId == patientId) {
                result.add(log);
            }
        }
        return result;
    }
}