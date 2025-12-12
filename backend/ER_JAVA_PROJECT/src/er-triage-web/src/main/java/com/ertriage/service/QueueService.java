package com.ertriage.service;

import com.ertriage.dao.PatientDAO;
import com.ertriage.dto.PatientView;
import com.ertriage.model.Patient;
import com.ertriage.dto.WaitingRoomView;
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
        /**
     * Public-safe list of waiting patients for display in the waiting area.
     * - Uses existing DAO queue ordering
     * - Hides sensitive data (symptoms, vitals, full name)
     */
    public List<WaitingRoomView> listWaitingForDisplay() {
        // We typically want the full waiting list for the TV,
        // so we can request a large page (e.g. first 100).
        int page = 0;
        int size = 100;
        String nameFilter = null;

        List<Patient> patients = patientDAO.listWaiting(page * size, size, nameFilter);
        List<WaitingRoomView> result = new ArrayList<>();

        int position = 1;
        for (Patient p : patients) {
            WaitingRoomView w = new WaitingRoomView();
            w.id = p.id;
            w.position = position++;
            w.triageLevel = p.triageLevel;

            // Build a safe display name (e.g. "Ali A." or keep single word)
            String name = (p.name != null) ? p.name.trim() : "";
            if (name.isEmpty()) {
                w.displayName = "Patient " + p.id;
            } else {
                String[] parts = name.split("\\s+");
                if (parts.length == 1) {
                    w.displayName = parts[0];
                } else {
                    // First name + initial of second part
                    w.displayName = parts[0] + " " + parts[1].charAt(0) + ".";
                }
            }

            result.add(w);
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