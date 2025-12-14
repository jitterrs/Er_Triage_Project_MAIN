package com.ertriage.dto;

import com.ertriage.model.Patient;
import com.ertriage.model.TriageResult;

public class WaitingRoomView {

    // Existing fields for triage display
    public long patientId;
    public String name;
    public int triageLevel;
    public String reason;

    // Extra fields used by QueueService for waiting room screen
    public long id;            // internal patient ID (or queue ID)
    public int position;       // position in the waiting queue
    public String displayName; // safe name to show publicly (e.g. "Ali A.")

    public WaitingRoomView() {}

    public WaitingRoomView(long patientId, String name, int triageLevel, String reason) {
        this.patientId = patientId;
        this.name = name;
        this.triageLevel = triageLevel;
        this.reason = reason;
    }

    public static WaitingRoomView fromPatient(Patient p, TriageResult result) {
        if (p == null || result == null) {
            return null;
        }

        WaitingRoomView w = new WaitingRoomView(
                p.id,
                p.name,
                result.level,
                result.reason
        );

        // Also fill queue-related fields with defaults
        w.id = p.id;
        w.triageLevel = result.level;
        // position and displayName will typically be set by QueueService
        return w;
    }

    public String toJSON() {
        return "{"
                + "\"patientId\":" + patientId + ","
                + "\"name\":\"" + escape(name) + "\","
                + "\"triageLevel\":" + triageLevel + ","
                + "\"reason\":\"" + escape(reason) + "\""
                + "}";
    }

    private String escape(String s) {
        if (s == null) return "";
        return s.replace("\"", "\\\"");
    }
}
