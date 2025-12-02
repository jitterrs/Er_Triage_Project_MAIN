package com.ertriage.dao;

import com.ertriage.model.Patient;
import com.ertriage.model.Status;

import java.util.ArrayList;
import java.util.List;

public class PatientDAO {

    public static List<Patient> patients = new ArrayList<>();
    public static long nextId = 1;

    // 7.8.1 save()
    public void save(Patient p) {
        p.id = nextId++;
        patients.add(p);
    }

    // 7.8.2 update()
    public void update(Patient p) {
        // in-memory demo: nothing special needed, object already updated
    }

    // 7.8.3 findById()
    public Patient findById(long id) {
        for (Patient p : patients) {
            if (p.id == id) {
                return p;
            }
        }
        return null;
    }

    // 7.8.4 listWaiting()
    public List<Patient> listWaiting(int offset, int limit, String nameFilter) {
        List<Patient> filtered = new ArrayList<>();
        for (Patient p : patients) {
            if (p.status == Status.WAITING) {
                if (nameFilter == null ||
                        p.name.toLowerCase().contains(nameFilter.toLowerCase())) {
                    filtered.add(p);
                }
            }
        }

        if (limit <= 0) {
            return filtered;
        }

        int from = Math.min(offset, filtered.size());
        int to = Math.min(offset + limit, filtered.size());
        return filtered.subList(from, to);
    }
}