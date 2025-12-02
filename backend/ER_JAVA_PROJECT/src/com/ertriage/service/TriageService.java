package com.ertriage.service;

import com.ertriage.model.Patient;
import com.ertriage.model.TriageResult;

public class TriageService {

    // 7.5.1 evaluate()
    public TriageResult evaluate(Patient patient) {
        // Placeholder logic so code compiles and runs
        int score = 0;
        boolean red = false;
        int level = 3;
        String reason = "Auto-evaluated (placeholder)";
        return new TriageResult(level, score, red, reason);
    }
}