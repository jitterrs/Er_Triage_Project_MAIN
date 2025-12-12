package com.ertriage.service;

import com.ertriage.dao.PatientDAO;
import com.ertriage.dto.WaitingRoomView;
import com.ertriage.model.Patient;
import com.ertriage.model.TriageResult;

import java.util.ArrayList;
import java.util.List;

/**
 * Service for building the waiting-room view from Patient entities.
 * Uses PatientDAO.listWaiting(...) and converts to WaitingRoomView DTOs.
 */
public class WaitingRoomService {

    private final PatientDAO patientDAO = new PatientDAO();

    /**
     * Get a page of waiting-room patients as DTOs.
     *
     * @param page       1-based page index (1, 2, 3, ...)
     * @param size       number of records per page
     * @param nameFilter optional name filter (may be null or blank)
     * @return list of WaitingRoomView entries for the web UI
     */
    public List<WaitingRoomView> getWaitingRoom(int page, int size, String nameFilter) {
        if (page < 1) {
            page = 1;
        }
        if (size <= 0) {
            size = 20;
        }

        int offset = (page - 1) * size;

        // Get patients with status = WAITING, already sorted by triage_level, triage_score, created_at
        List<Patient> patients = patientDAO.listWaiting(offset, size, nameFilter);
        List<WaitingRoomView> views = new ArrayList<>();

        for (Patient p : patients) {
            // We already stored triageLevel, triageScore, redFlag, triageReason in the DB,
            // so we can rebuild a TriageResult object from the Patient without re-evaluating:
            TriageResult tr = new TriageResult(
                    p.triageLevel,
                    p.triageScore,
                    p.redFlag,
                    p.triageReason
            );

            WaitingRoomView dto = WaitingRoomView.fromPatient(p, tr);
            if (dto != null) {
                views.add(dto);
            }
        }

        return views;
    }

    /**
     * Convenience method: returns waiting-room data as a JSON array string.
     * Your HTTP layer can call this and write it as the response body.
     */
    public String getWaitingRoomJson(int page, int size, String nameFilter) {
        List<WaitingRoomView> views = getWaitingRoom(page, size, nameFilter);

        StringBuilder sb = new StringBuilder();
        sb.append("[");

        for (int i = 0; i < views.size(); i++) {
            if (i > 0) {
                sb.append(",");
            }
            sb.append(views.get(i).toJSON());
        }

        sb.append("]");
        return sb.toString();
    }
}
