package com.investigation.agent.model;

/**
 * Shared Risk Classification Utility
 *
 * Configured Rules:
 * - Model Probability: [0.0, 1.0] (statistical anomaly probability from model)
 * - Application Risk Score: [0, 100] derived as round(probability * 100)
 * - Model Prediction:
 *     probability >= 0.50 -> "SUSPICIOUS"
 *     probability < 0.50  -> "NORMAL"
 * - Application Risk Level (Severity Category):
 *     80..100 -> "CRITICAL"
 *     60..79  -> "HIGH"
 *     35..59  -> "MEDIUM"
 *     0..34   -> "LOW"
 *
 * Example:
 * If model probability is 0.83 (83%), the application risk score is 83/100,
 * the model prediction is SUSPICIOUS, and the application risk level is CRITICAL.
 */
public class RiskClassification {

    public static final double PREDICTION_THRESHOLD = 0.50;
    public static final int THRESHOLD_CRITICAL = 80;
    public static final int THRESHOLD_HIGH = 60;
    public static final int THRESHOLD_MEDIUM = 35;

    public static int probabilityToScore(double probability) {
        double clamped = Math.min(Math.max(probability, 0.0), 1.0);
        return (int) Math.round(clamped * 100.0);
    }

    public static String scoreToRiskLevel(int riskScore) {
        if (riskScore >= THRESHOLD_CRITICAL) {
            return "CRITICAL";
        } else if (riskScore >= THRESHOLD_HIGH) {
            return "HIGH";
        } else if (riskScore >= THRESHOLD_MEDIUM) {
            return "MEDIUM";
        } else {
            return "LOW";
        }
    }

    public static String probabilityToPrediction(double probability) {
        return probability >= PREDICTION_THRESHOLD ? "SUSPICIOUS" : "NORMAL";
    }

    public static RiskResult classify(double probability) {
        int score = probabilityToScore(probability);
        String prediction = probabilityToPrediction(probability);
        String level = scoreToRiskLevel(score);
        return new RiskResult(probability, score, prediction, level);
    }

    public static class RiskResult {
        private final double probability;
        private final int riskScore;
        private final String prediction;
        private final String riskLevel;

        public RiskResult(double probability, int riskScore, String prediction, String riskLevel) {
            this.probability = probability;
            this.riskScore = riskScore;
            this.prediction = prediction;
            this.riskLevel = riskLevel;
        }

        public double getProbability() { return probability; }
        public int getRiskScore() { return riskScore; }
        public String getPrediction() { return prediction; }
        public String getRiskLevel() { return riskLevel; }
    }
}
