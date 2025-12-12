package com.ertriage.service;

import com.ertriage.Config.TriageConfig;
import java.util.Set;
import java.util.LinkedHashSet;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Simple text-based keyword scorer for symptoms.
 * Looks for configured keywords in the free-text symptom description.
 */
public class KeywordService {

    public static class SymptomAnalysis {
        public final int score;
        public final boolean redFlag;
        public final List<String> matchedKeywords;

        public SymptomAnalysis(int score, boolean redFlag, List<String> matchedKeywords) {
            this.score = score;
            this.redFlag = redFlag;
            this.matchedKeywords = matchedKeywords;
        }
    }

    /**
     * Analyze symptom free text:
     *  - add score for each matched normal symptom keyword
     *  - add score and mark redFlag=true for each red-flag keyword
     */
    public SymptomAnalysis analyze(String symptoms) {
        if (symptoms == null || symptoms.trim().isEmpty()) {
            return new SymptomAnalysis(0, false, new ArrayList<String>());
        }

        String text = symptoms.toLowerCase();
        int score = 0;
        boolean redFlag = false;
        List<String> hits = new ArrayList<>();

        // Normal symptom weights
        for (Map.Entry<String, Integer> e : TriageConfig.SYMPTOM_WEIGHTS.entrySet()) {
            String key = e.getKey().toLowerCase();
            if (text.contains(key)) {
                score += e.getValue();
                hits.add(key);
            }
        }

        // Red-flag keywords
        for (Map.Entry<String, Integer> e : TriageConfig.RED_FLAG_KEYWORDS.entrySet()) {
            String key = e.getKey().toLowerCase();
            if (text.contains(key)) {
                score += e.getValue();
                redFlag = true;
                hits.add(key + " (red flag)");
            }
        }

        return new SymptomAnalysis(score, redFlag, hits);
    }

    // UML: extract(String symptomText): Set<String>
// Uses the existing analyze() logic and returns only the keyword strings.
public Set<String> extract(String symptomText) {
    // Avoid null pointer
    String text = (symptomText == null) ? "" : symptomText;

    // Reuse existing logic
    SymptomAnalysis analysis = analyze(text);

    // Use LinkedHashSet to avoid duplicates and keep insertion order
    Set<String> keywords = new LinkedHashSet<>();

    // NOTE: the field name is matchedKeywords, not hits
    for (String hit : analysis.matchedKeywords) {
        // hits might look like "chest pain (+2)" or "shortness of breath (red flag)"
        // Strip anything after " (" to get a cleaner keyword
        String base = hit;
        int idx = base.indexOf(" (");
        if (idx >= 0) {
            base = base.substring(0, idx);
        }
        keywords.add(base);
    }

    return keywords;
}


}
