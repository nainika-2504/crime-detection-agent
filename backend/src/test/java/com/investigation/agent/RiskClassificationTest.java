package com.investigation.agent;

import com.investigation.agent.model.RiskClassification;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class RiskClassificationTest {

    @Test
    @DisplayName("Should correctly classify the 83% probability example to SUSPICIOUS, 83/100, CRITICAL")
    void testEightyThreePercentExample() {
        double probability = 0.83;

        int score = RiskClassification.probabilityToScore(probability);
        String prediction = RiskClassification.probabilityToPrediction(probability);
        String level = RiskClassification.scoreToRiskLevel(score);

        assertEquals(83, score, "Score must be 83 for 0.83 probability");
        assertEquals("SUSPICIOUS", prediction, "Prediction must be SUSPICIOUS for 0.83");
        assertEquals("CRITICAL", level, "Risk Level must be CRITICAL for score 83 (80..100)");

        RiskClassification.RiskResult result = RiskClassification.classify(probability);
        assertEquals(0.83, result.getProbability());
        assertEquals(83, result.getRiskScore());
        assertEquals("SUSPICIOUS", result.getPrediction());
        assertEquals("CRITICAL", result.getRiskLevel());
    }

    @Test
    @DisplayName("Should separate model prediction from application risk levels across boundary tiers")
    void testBoundaryTiers() {
        // Low risk, Normal
        assertEquals("LOW", RiskClassification.scoreToRiskLevel(0));
        assertEquals("LOW", RiskClassification.scoreToRiskLevel(34));
        assertEquals("NORMAL", RiskClassification.probabilityToPrediction(0.34));

        // Medium risk, Normal (below 0.50)
        assertEquals("MEDIUM", RiskClassification.scoreToRiskLevel(35));
        assertEquals("NORMAL", RiskClassification.probabilityToPrediction(0.35));
        assertEquals("MEDIUM", RiskClassification.scoreToRiskLevel(49));
        assertEquals("NORMAL", RiskClassification.probabilityToPrediction(0.49));

        // Medium risk, Suspicious (at or above 0.50)
        assertEquals("MEDIUM", RiskClassification.scoreToRiskLevel(50));
        assertEquals("SUSPICIOUS", RiskClassification.probabilityToPrediction(0.50));
        assertEquals("MEDIUM", RiskClassification.scoreToRiskLevel(59));
        assertEquals("SUSPICIOUS", RiskClassification.probabilityToPrediction(0.59));

        // High risk, Suspicious
        assertEquals("HIGH", RiskClassification.scoreToRiskLevel(60));
        assertEquals("SUSPICIOUS", RiskClassification.probabilityToPrediction(0.60));
        assertEquals("HIGH", RiskClassification.scoreToRiskLevel(79));
        assertEquals("SUSPICIOUS", RiskClassification.probabilityToPrediction(0.79));

        // Critical risk, Suspicious
        assertEquals("CRITICAL", RiskClassification.scoreToRiskLevel(80));
        assertEquals("SUSPICIOUS", RiskClassification.probabilityToPrediction(0.80));
        assertEquals("CRITICAL", RiskClassification.scoreToRiskLevel(100));
        assertEquals("SUSPICIOUS", RiskClassification.probabilityToPrediction(1.0));
    }

    @Test
    @DisplayName("Should clamp probability safely between 0.0 and 1.0")
    void testClamping() {
        assertEquals(0, RiskClassification.probabilityToScore(-0.15));
        assertEquals(100, RiskClassification.probabilityToScore(1.45));
    }
}
