package com.ertriage.service;

import com.ertriage.dao.PatientDAO;
import com.ertriage.dto.PatientView;
import com.ertriage.model.Patient;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class QueueService {

    private final PatientDAO patientDAO;

    public QueueService(PatientDAO patientDAO) {
        this.patientDAO = patientDAO;
    }

    // 7.4.1 listWaiting()
    public List<PatientView> listWaiting(int page, int size, String nameFilter) {
        int offset = page * size;
        List<Patient> patients = patientDAO.listWaiting(offset, size, nameFilter);

        List<PatientView> result = new ArrayList<>();
        for (Patient p : patients) {
            PatientView v = new PatientView();
            v.id = p.id;
            v.name = p.name;
            v.triageLevel = p.triageLevel;
            v.triageScore = p.triageScore;
            v.status = p.status;
            result.add(v);
        }
        return result;
    }

    // 7.4.2 countsByLevel()
    public Map<String, Long> countsByLevel() {
        List<Patient> patients = patientDAO.listWaiting(0, Integer.MAX_VALUE, null);
        Map<String, Long> counts = new HashMap<>();

        for (Patient p : patients) {
            String key = String.valueOf(p.triageLevel);
            counts.put(key, counts.getOrDefault(key, 0L) + 1L);
        }
        return counts;
    }
}