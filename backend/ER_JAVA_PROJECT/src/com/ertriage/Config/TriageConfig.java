package com.ertriage.Config;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

/**
 * Central place for triage thresholds and keyword weights.
 * Change values here to tune behavior WITHOUT touching logic.
 */
public final class TriageConfig {

    // Score thresholds for triage levels when there is no hard red flag
    public static final int LEVEL_2_SCORE_THRESHOLD = 8;
    public static final int LEVEL_3_SCORE_THRESHOLD = 4;

    /**
     * Normal symptom weights (non–red flag).
     * These are added to the score when the text contains the keyword.
     */
    public static final Map<String, Integer> SYMPTOM_WEIGHTS;

    /**
     * Red-flag symptom keywords. Presence of any of these:
     *  - sets redFlag = true
     *  - adds a big weight to the score
     */
    public static final Map<String, Integer> RED_FLAG_KEYWORDS;

    static {
        // Normal symptom weights
        HashMap<String, Integer> s = new HashMap<>();
        s.put("headache", 2);
        s.put("nausea", 1);
        s.put("vomiting", 2);
        s.put("abdominal pain", 4);
        s.put("fever", 2);
        s.put("dizziness", 2);
        s.put("chest pain", 6);           // strong non-red by default
        s.put("shortness of breath", 6);  // strong non-red
        SYMPTOM_WEIGHTS = Collections.unmodifiableMap(s);

        // Red-flag keywords (critical)
        HashMap<String, Integer> r = new HashMap<>();
        r.put("loss of consciousness", 10);
        r.put("unresponsive", 10);
        r.put("severe bleeding", 10);
        r.put("difficulty breathing", 8);
        r.put("stroke", 8);
        r.put("suicidal", 8);
        r.put("cardiac arrest", 12);
        RED_FLAG_KEYWORDS = Collections.unmodifiableMap(r);
    }

    private TriageConfig() {
        // no instances
    }
}
