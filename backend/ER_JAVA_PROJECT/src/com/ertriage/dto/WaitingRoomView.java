package com.ertriage.dto;

import com.ertriage.model.Patient;
import com.ertriage.model.TriageResult;

public class WaitingRoomView {

    public long patientId;
    public String name;
    public int triageLevel;
    public String reason;

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

        return new WaitingRoomView(
                p.id,
                p.name,
                result.level,
                result.reason
        );
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
