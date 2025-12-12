package com.ertriage.service;

import com.ertriage.Config.TriageConfig;
import com.ertriage.model.Patient;
import com.ertriage.model.TriageResult;
import com.ertriage.model.Vitals;

/**
 * Core triage logic.
 * CTAS-inspired 5-level triage:
 *  1 = Resuscitation (red flag / critical vitals)
 *  2 = Emergent       (moderately dangerous vitals / high-risk symptoms)
 *  3 = Urgent         (significant but stable – based mainly on score)
 *  4 = Less Urgent
 *  5 = Non-Urgent
 */
public class TriageService {

    private final KeywordService keywordService = new KeywordService();

    // 7.5.1 evaluate()
    public TriageResult evaluate(Patient patient) {
        if (patient == null) {
            throw new IllegalArgumentException("patient cannot be null");
        }

        int score = 0;
        boolean redFlag = false;
        StringBuilder reason = new StringBuilder();

        // --------------------------------------------------
        // 1) Symptoms via KeywordService (chief complaint)
        // --------------------------------------------------
        KeywordService.SymptomAnalysis sym = keywordService.analyze(patient.symptoms);
        score += sym.score;
        if (sym.redFlag) {
            redFlag = true;
        }
        if (!sym.matchedKeywords.isEmpty()) {
            reason.append("Symptoms: ").append(sym.matchedKeywords).append(". ");
        }

        // --------------------------------------------------
        // 2) Vitals-based CTAS modifiers
        //    We track:
        //      - critical (Level 1) vitals
        //      - emergent (Level 2) vitals
        // --------------------------------------------------
        Vitals v = patient.vitals;
        boolean hasCriticalVital = false;  // CTAS ~ Level 1
        boolean hasEmergentVital = false;  // CTAS ~ Level 2

        if (v != null) {
            // -------- Blood pressure --------
            if (v.bpSys != null || v.bpDia != null) {
                Integer sys = v.bpSys;
                Integer dia = v.bpDia;

                // Strongly abnormal BP → treat as critical (Level 1)
                if ((sys != null && sys >= 180) || (dia != null && dia >= 120)) {
                    score += 6;
                    hasCriticalVital = true;
                    redFlag = true;
                    reason.append("Severely abnormal blood pressure. ");
                }
                // Moderately high BP → emergent (Level 2)
                else if ((sys != null && sys >= 160) || (dia != null && dia >= 100)) {
                    score += 3;
                    hasEmergentVital = true;
                    reason.append("High blood pressure. ");
                }
            }

            // -------- Heart rate --------
            if (v.hr != null) {
                // Critical HR → Level 1
                if (v.hr >= 130 || v.hr <= 40) {
                    score += 6;
                    hasCriticalVital = true;
                    redFlag = true;
                    reason.append("Critical heart rate (").append(v.hr).append("). ");
                }
                // Moderately abnormal HR → Level 2 range
                else if (v.hr >= 110 || v.hr <= 50) {
                    score += 3;
                    hasEmergentVital = true;
                    reason.append("Abnormal heart rate (").append(v.hr).append("). ");
                }
            }

            // -------- Respiratory rate --------
            if (v.rr != null) {
                // Critical RR → Level 1
                if (v.rr >= 30) {
                    score += 6;
                    hasCriticalVital = true;
                    redFlag = true;
                    reason.append("Severe respiratory rate (").append(v.rr).append("). ");
                }
                // Moderately high RR → Level 2 range
                else if (v.rr >= 22) {
                    score += 3;
                    hasEmergentVital = true;
                    reason.append("Elevated respiratory rate (").append(v.rr).append("). ");
                }
            }

            // -------- SpO2 --------
            if (v.spo2 != null) {
                // Very low SpO2 → Level 1
                if (v.spo2 < 90) {
                    score += 6;
                    hasCriticalVital = true;
                    redFlag = true;
                    reason.append("Very low SpO\u2082 (").append(v.spo2).append("%). ");
                }
                // Low SpO2 → Level 2
                else if (v.spo2 < 94) {
                    score += 3;
                    hasEmergentVital = true;
                    reason.append("Low SpO\u2082 (").append(v.spo2).append("%). ");
                }
            }

            // -------- Temperature --------
            if (v.temp != null) {
                // Very high fever or hypothermia → Level 1
                if (v.temp >= 39.5) {
                    score += 4;
                    hasCriticalVital = true;
                    redFlag = true;
                    reason.append("Very high temperature (").append(v.temp).append("\u00B0C). ");
                } else if (v.temp <= 35.0) {
                    score += 4;
                    hasCriticalVital = true;
                    redFlag = true;
                    reason.append("Hypothermia (").append(v.temp).append("\u00B0C). ");
                }
                // Moderate fever → Level 2/3 region
                else if (v.temp >= 38.0) {
                    score += 2;
                    hasEmergentVital = true;
                    reason.append("Fever (").append(v.temp).append("\u00B0C). ");
                }
            }
        }

        // --------------------------------------------------
        // 3) Final CTAS-like decision logic
        //     Step 1: any red-flag or critical vital → Level 1
        //     Step 2: any emergent vital OR very high score → Level 2
        //     Step 3: otherwise use score to distinguish 3/4/5
        // --------------------------------------------------
        int level;

        // LEVEL 1 – Resuscitation
        if (redFlag || hasCriticalVital) {
            level = 1;
        }
        // LEVEL 2 – Emergent:
        //   - emergent vital signs OR
        //   - very high combined score (e.g. many concerning findings)
        else if (hasEmergentVital || score >= TriageConfig.LEVEL_2_SCORE_THRESHOLD) {
            level = 2;
        }
        // LEVEL 3 – Urgent:
        //   moderate score (still concerning, but more stable)
        else if (score >= TriageConfig.LEVEL_3_SCORE_THRESHOLD) {
            level = 3;
        }
        // LEVEL 4 – Less Urgent:
        else if (score > 0) {
            level = 4;
        }
        // LEVEL 5 – Non-Urgent:
        else {
            level = 5;
        }

        if (reason.length() == 0) {
            reason.append("No critical findings. Auto-evaluated as low acuity.");
        }

        return new TriageResult(level, score, redFlag, reason.toString());
    }

    // UML: hasRedFlags(Patient): boolean
    // Implementation: reuse evaluate() result.
    public boolean hasRedFlags(Patient patient) {
        TriageResult result = evaluate(patient);
        return result.redFlag;
    }

    // UML: computeScore(Patient): int
    // Implementation: reuse evaluate() result.
    public int computeScore(Patient patient) {
        TriageResult result = evaluate(patient);
        return result.score;
    }

    // UML: mapScoreToLevel(int score): int
    // NOTE: This is a purely score-based mapping (no vitals),
    //       kept for UML completeness. The real logic is in evaluate().
    public int mapScoreToLevel(int score) {
        if (score >= TriageConfig.LEVEL_2_SCORE_THRESHOLD) {
            return 2;
        } else if (score >= TriageConfig.LEVEL_3_SCORE_THRESHOLD) {
            return 3;
        } else if (score > 0) {
            return 4;
        } else {
            return 5;
        }
    }

    // UML: buildReason(Patient, level, score, redFlag): String
    // For now we simply reuse the explanation from a full evaluation.
    public String buildReason(Patient patient, int level, int score, boolean redFlagParam) {
        TriageResult result = evaluate(patient);
        return result.reason;
    }
}
