package com.ertriage.service;

import com.ertriage.Config.TriageConfig;
import com.ertriage.model.Patient;
import com.ertriage.model.TriageResult;
import com.ertriage.model.Vitals;

/**
 * Core triage logic.
 * Combines vitals + symptom keywords into a triage score and level.
 */
public class TriageService {

    private final KeywordService keywordService = new KeywordService();

    // 7.5.1 evaluate()
    public TriageResult evaluate(Patient patient) {
        if (patient == null) {
            throw new IllegalArgumentException("patient cannot be null");
        }

        int score = 0;
        boolean red = false;
        StringBuilder reason = new StringBuilder();

        // --------------------------
        // 1) Symptoms via KeywordService
        // --------------------------
        KeywordService.SymptomAnalysis sym = keywordService.analyze(patient.symptoms);
        score += sym.score;
        if (sym.redFlag) {
            red = true;
        }
        if (!sym.matchedKeywords.isEmpty()) {
            reason.append("Symptoms: ").append(sym.matchedKeywords).append(". ");
        }

        // --------------------------
        // 2) Vitals-based scoring
        // --------------------------
        Vitals v = patient.vitals;
        if (v != null) {
            // Blood pressure
            if (v.bpSys != null || v.bpDia != null) {
                Integer sys = v.bpSys;
                Integer dia = v.bpDia;

                if ((sys != null && sys >= 180) || (dia != null && dia >= 120)) {
                    score += 6;
                    red = true;
                    reason.append("Severely abnormal blood pressure. ");
                } else if ((sys != null && sys >= 160) || (dia != null && dia >= 100)) {
                    score += 3;
                    reason.append("High blood pressure. ");
                }
            }

            // Heart rate
            if (v.hr != null) {
                if (v.hr >= 130 || v.hr <= 40) {
                    score += 6;
                    red = true;
                    reason.append("Critical heart rate (").append(v.hr).append("). ");
                } else if (v.hr >= 110 || v.hr <= 50) {
                    score += 3;
                    reason.append("Abnormal heart rate (").append(v.hr).append("). ");
                }
            }

            // Respiratory rate
            if (v.rr != null) {
                if (v.rr >= 30) {
                    score += 6;
                    red = true;
                    reason.append("Severe respiratory rate (").append(v.rr).append("). ");
                } else if (v.rr >= 22) {
                    score += 3;
                    reason.append("Elevated respiratory rate (").append(v.rr).append("). ");
                }
            }

            // SpO2
            if (v.spo2 != null) {
                if (v.spo2 < 90) {
                    score += 6;
                    red = true;
                    reason.append("Very low SpO₂ (").append(v.spo2).append("%). ");
                } else if (v.spo2 < 94) {
                    score += 3;
                    reason.append("Low SpO₂ (").append(v.spo2).append("%). ");
                }
            }

            // Temperature
            if (v.temp != null) {
                if (v.temp >= 39.5) {
                    score += 4;
                    red = true;
                    reason.append("Very high temperature (").append(v.temp).append("°C). ");
                } else if (v.temp >= 38.0) {
                    score += 2;
                    reason.append("Fever (").append(v.temp).append("°C). ");
                } else if (v.temp <= 35.0) {
                    score += 4;
                    red = true;
                    reason.append("Hypothermia (").append(v.temp).append("°C). ");
                }
            }
        }

        // --------------------------
        // 3) Final level decision
        // --------------------------
        int level;
        if (red) {
            level = 1; // immediate
        } else if (score >= TriageConfig.LEVEL_2_SCORE_THRESHOLD) {
            level = 2;
        } else if (score >= TriageConfig.LEVEL_3_SCORE_THRESHOLD) {
            level = 3;
        } else if (score > 0) {
            level = 4;
        } else {
            level = 5; // lowest urgency
        }

        if (reason.length() == 0) {
            reason.append("No critical findings. Auto-evaluated.");
        }

        return new TriageResult(level, score, red, reason.toString());
    }
}
