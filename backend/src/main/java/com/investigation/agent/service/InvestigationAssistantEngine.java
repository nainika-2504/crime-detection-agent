package com.investigation.agent.service;

import com.investigation.agent.dto.AssistantRequest;
import com.investigation.agent.dto.AssistantResponse;
import com.investigation.agent.model.InvestigationCase;
import com.investigation.agent.model.RiskClassification;
import org.springframework.stereotype.Service;

import java.text.NumberFormat;
import java.util.*;
import java.util.regex.Pattern;

/**
 * Intelligent Evidence-Grounded Assistant Engine
 * Strictly adheres to ethical forensics:
 * - Differentiates greetings/thanks/help from case inquiries without creating ML jobs.
 * - Answers case inquiries strictly using recorded case fields.
 * - Distinguishes confirmed missing intake fields from recommended additional evidence.
 * - Maintains shared risk scoring rules: Model Probability, Risk Score, Prediction, Risk Level.
 * - Never invents facts or asserts Tor/VPN claims without verified evidence.
 */
@Service
public class InvestigationAssistantEngine {

    private static final String DISCLAIMER_TEXT =
            "Statistical inferences do not constitute definitive proof of criminal activity. Findings must be corroborated with verified evidentiary standards.";

    private static final Pattern GREETING_PATTERN = Pattern.compile(
            "^(hi|hello|hey|greetings|howdy|hiya|good\\s+(morning|afternoon|evening)|salutations)([\\s!?,.]|$)",
            Pattern.CASE_INSENSITIVE
    );

    private static final Pattern THANKS_PATTERN = Pattern.compile(
            "\\b(thank\\s+you|thanks|much\\s+appreciated|appreciate\\s+it|thx)\\b",
            Pattern.CASE_INSENSITIVE
    );

    private static final Pattern HELP_PATTERN = Pattern.compile(
            "\\b(help|what\\s+can\\s+you\\s+do|capabilities|commands|how\\s+to\\s+use|options)\\b",
            Pattern.CASE_INSENSITIVE
    );

    public AssistantResponse processInquiry(AssistantRequest request, Optional<InvestigationCase> persistedCase) {
        String rawQuestion = request.getQuestion() != null ? request.getQuestion().trim() : "";
        String normalizedQ = rawQuestion.toLowerCase();

        // 1. GREETING Intent
        if (isGreeting(normalizedQ)) {
            return new AssistantResponse(
                    "Greetings, Investigator. I am the Investigation Assistant for this archive. " +
                            "I can help you examine active case dossiers, analyze recorded evidence indicators, " +
                            "explain risk scoring, identify missing data, and suggest investigative protocols. " +
                            "How may I assist your inquiry today?",
                    Collections.emptyList(),
                    "GREETING",
                    "NOT_APPLICABLE",
                    DISCLAIMER_TEXT
            );
        }

        // 2. THANKS Intent
        if (isThanks(normalizedQ)) {
            return new AssistantResponse(
                    "You are welcome, Investigator. The archive desk remains available if you need further examination " +
                            "of this case file or additional evidence correlation.",
                    Collections.emptyList(),
                    "ACKNOWLEDGMENT",
                    "NOT_APPLICABLE",
                    DISCLAIMER_TEXT
            );
        }

        // 3. HELP Intent
        if (isHelp(normalizedQ)) {
            String helpText = "Investigation Desk Capabilities:\n\n" +
                    "• Case Summaries: Ask 'Summarize this case' for a structured overview of recorded facts, scope, and classification.\n" +
                    "• Flag Reasons: Ask 'Why was this case flagged?' to examine only observed indicators and their forensic relevance.\n" +
                    "• Indicator Breakdown: Ask 'Which indicators contributed?' to inspect observed versus unasserted flags on record.\n" +
                    "• Evidence Gaps: Ask 'What information is missing?' to check unrecorded intake fields versus recommended follow-up evidence.\n" +
                    "• Investigative Next Steps: Ask 'What should I investigate next?' for proportionate verification protocols.\n" +
                    "• Risk Questions: Ask 'Explain the risk score' to inspect the relationship between model probability and risk tier.";
            return new AssistantResponse(
                    helpText,
                    List.of("Investigation Desk Protocol"),
                    "GUIDANCE",
                    "HIGH",
                    DISCLAIMER_TEXT
            );
        }

        // Extract Case Data (merging persisted database record with any request overrides)
        Map<String, Object> ctx = request.getCaseContext() != null ? request.getCaseContext() : Collections.emptyMap();
        CaseSnapshot snapshot = buildSnapshot(ctx, persistedCase);

        if (!snapshot.hasCase()) {
            return new AssistantResponse(
                    "No active case dossier is currently loaded into the investigation desk. " +
                            "Please submit an investigation form or select a case dossier from the archive to examine evidence.",
                    Collections.emptyList(),
                    "INITIAL_DISCOVERY",
                    "NOT_APPLICABLE",
                    DISCLAIMER_TEXT
            );
        }

        // Intent: WHY_FLAGGED
        if (normalizedQ.contains("why") || normalizedQ.contains("flagged") || normalizedQ.contains("cause") || normalizedQ.contains("reason")) {
            return buildWhyFlaggedResponse(snapshot);
        }

        // Intent: EVIDENCE_INDICATORS
        if (normalizedQ.contains("indicator") || normalizedQ.contains("contribute") || normalizedQ.contains("factor") || normalizedQ.contains("weight")) {
            return buildIndicatorsResponse(snapshot);
        }

        // Intent: EVIDENCE_GAPS
        if (normalizedQ.contains("missing") || normalizedQ.contains("gap") || normalizedQ.contains("need") || normalizedQ.contains("information")) {
            return buildEvidenceGapsResponse(snapshot);
        }

        // Intent: NEXT_STEPS
        if (normalizedQ.contains("next") || normalizedQ.contains("review") || normalizedQ.contains("recommend") || normalizedQ.contains("action") || normalizedQ.contains("step")) {
            return buildNextStepsResponse(snapshot);
        }

        // Intent: RISK_QUESTION
        if (normalizedQ.contains("risk") || normalizedQ.contains("score") || normalizedQ.contains("level") || normalizedQ.contains("probability") || normalizedQ.contains("tier")) {
            return buildRiskResponse(snapshot);
        }

        // Intent: CASE_SUMMARY or fallback
        return buildSummaryResponse(snapshot);
    }

    private boolean isGreeting(String q) {
        if (q.isEmpty()) return false;
        return GREETING_PATTERN.matcher(q).find();
    }

    private boolean isThanks(String q) {
        return THANKS_PATTERN.matcher(q).find();
    }

    private boolean isHelp(String q) {
        return HELP_PATTERN.matcher(q).find();
    }

    private AssistantResponse buildWhyFlaggedResponse(CaseSnapshot c) {
        List<String> cited = new ArrayList<>();
        cited.add("Case: " + c.caseId);

        if ("SUSPICIOUS".equalsIgnoreCase(c.prediction) || c.riskScore >= 50) {
            List<String> reasons = new ArrayList<>();

            if (Boolean.TRUE.equals(c.previousSuspiciousActivity)) {
                reasons.add("Prior Suspicious Flag on record: Entity has historical linkage to documented forensic alerts.");
                cited.add("previousSuspiciousActivity = true");
            }
            if (c.failedLoginAttempts != null && c.failedLoginAttempts >= 3) {
                reasons.add(c.failedLoginAttempts + " failed authentication attempts recorded prior to transaction execution (authentication anomaly).");
                cited.add("failedLoginAttempts = " + c.failedLoginAttempts);
            } else if (c.failedLoginAttempts != null && c.failedLoginAttempts > 0) {
                reasons.add(c.failedLoginAttempts + " failed authentication challenge(s) recorded.");
                cited.add("failedLoginAttempts = " + c.failedLoginAttempts);
            }
            if (Boolean.TRUE.equals(c.unusualLocation)) {
                String locStr = c.location != null && !c.location.isBlank() ? c.location : "Location not recorded";
                reasons.add("Anomalous geolocation asserted: Originating jurisdiction (" + locStr + ") deviates from historical baseline.");
                cited.add("unusualLocation = true");
            }
            if (Boolean.TRUE.equals(c.rapidTransfer)) {
                reasons.add("Rapid velocity transfers asserted: High-frequency disbursement within a compressed timeframe.");
                cited.add("rapidTransfer = true");
            }
            if (Boolean.TRUE.equals(c.newDevice)) {
                reasons.add("Unrecognized device asserted: Access originated from an unregistered browser environment or unverified hardware.");
                cited.add("newDevice = true");
            }
            if (Boolean.TRUE.equals(c.multipleTransfers)) {
                reasons.add("Multiple concurrent transfers asserted: Fan-out disbursement across multiple disjoint beneficiary endpoints.");
                cited.add("multipleTransfers = true");
            }
            if (c.accountAgeDays != null && c.accountAgeDays < 30) {
                reasons.add("New account genesis: Account opened " + c.accountAgeDays + " days ago (elevated inception risk).");
                cited.add("accountAgeDays = " + c.accountAgeDays);
            }
            if (c.transactionAmount != null && c.transactionAmount > 50000.0) {
                reasons.add("Substantial financial scope: Transaction amount of " + c.getFormattedAmount() + " exceeds automated monitoring threshold.");
                cited.add("transactionAmount = " + c.getFormattedAmount());
            }

            StringBuilder sb = new StringBuilder();
            sb.append("Case ").append(c.caseId).append(" was flagged as SUSPICIOUS with an Application Risk Score of ")
                    .append(c.riskScore).append("/100 (Model Probability: ").append(c.getFormattedProbability())
                    .append("%, Risk Level: ").append(c.riskLevel).append(").\n\n");

            if (!reasons.isEmpty()) {
                sb.append("Contributing observed indicators present in the case record:\n");
                for (int i = 0; i < reasons.size(); i++) {
                    sb.append(i + 1).append(". ").append(reasons.get(i)).append("\n");
                }
                sb.append("\nModel Inference: The trained RandomForestClassifier correlated these specific observed evidence flags ")
                        .append("to compute the elevated risk probability.");
            } else {
                sb.append("No specific adverse indicator checkboxes were marked active in the submitted case record. ")
                        .append("The risk score reflects base model evaluation against the submitted numeric parameters ")
                        .append("(Amount: ").append(c.getFormattedAmount()).append(", Account Age: ").append(c.getFormattedAge())
                        .append(", Frequency: ").append(c.getFormattedFrequency()).append(").");
            }

            return new AssistantResponse(sb.toString(), cited, "PRIMARY_TRIAGE", c.getFormattedProbability() + "%", DISCLAIMER_TEXT);
        } else {
            String answer = "Case " + c.caseId + " was NOT flagged as suspicious. The machine learning model evaluated the submitted parameters " +
                    "and classified the activity as NORMAL with a model probability of " + c.getFormattedProbability() + "% " +
                    "(Application Risk Score: " + c.riskScore + "/100, Risk Level: " + c.riskLevel + ").\n\n" +
                    "Key stabilizing factors on record:\n" +
                    "• Authentication challenges: " + (c.failedLoginAttempts != null ? c.failedLoginAttempts + " failed attempt(s)" : "Not recorded") + ".\n" +
                    "• Account maturity: " + c.getFormattedAge() + " in standing.\n" +
                    "• Hardware & location: " + (Boolean.TRUE.equals(c.newDevice) ? "New device flagged" : "No unrecognized device flag asserted") + ", " +
                    (Boolean.TRUE.equals(c.unusualLocation) ? "Unusual location flagged" : "No unusual location flag asserted") + ".";
            cited.add("prediction = NORMAL");
            cited.add("riskScore = " + c.riskScore);
            return new AssistantResponse(answer, cited, "CLEARED_TRIAGE", "HIGH", DISCLAIMER_TEXT);
        }
    }

    private AssistantResponse buildIndicatorsResponse(CaseSnapshot c) {
        List<String> activeIndicators = new ArrayList<>();
        List<String> inactiveIndicators = new ArrayList<>();

        checkIndicator(c.previousSuspiciousActivity, "Prior Suspicious Record on entity file", activeIndicators, inactiveIndicators);
        checkIndicator(c.unusualLocation, "Unusual Geolocation asserted (" + (c.location != null ? c.location : "Location not recorded") + ")", activeIndicators, inactiveIndicators);
        checkIndicator(c.newDevice, "Unregistered Device / hardware identifier", activeIndicators, inactiveIndicators);
        checkIndicator(c.rapidTransfer, "Rapid Velocity Transfers within execution window", activeIndicators, inactiveIndicators);
        checkIndicator(c.multipleTransfers, "Multiple Concurrent Transfers across endpoints", activeIndicators, inactiveIndicators);

        StringBuilder sb = new StringBuilder();
        sb.append("Evidence Indicator Breakdown for Case ").append(c.caseId).append(":\n\n");

        sb.append("1. Active Indicators on File:\n");
        if (!activeIndicators.isEmpty()) {
            for (String ind : activeIndicators) {
                sb.append("   • ").append(ind).append("\n");
            }
        } else {
            sb.append("   • None asserted on record.\n");
        }

        sb.append("\n2. Inactive / Unflagged Indicators on File:\n");
        if (!inactiveIndicators.isEmpty()) {
            for (String ind : inactiveIndicators) {
                sb.append("   • ").append(ind).append("\n");
            }
        } else {
            sb.append("   • All monitored indicators were active.\n");
        }

        sb.append("\n3. Recorded Numeric Parameters:\n")
                .append("   • Transaction Scope: ").append(c.getFormattedAmount()).append("\n")
                .append("   • Account Age: ").append(c.getFormattedAge()).append("\n")
                .append("   • Monthly Frequency: ").append(c.getFormattedFrequency()).append("\n")
                .append("   • Failed Login Challenges: ").append(c.failedLoginAttempts != null ? c.failedLoginAttempts : "Not recorded").append("\n\n")
                .append("Model Result: ").append(c.prediction).append(" (Risk Score: ").append(c.riskScore).append("/100, ")
                .append(c.riskLevel).append(" Risk).");

        List<String> cited = new ArrayList<>(activeIndicators);
        cited.add("Case: " + c.caseId);
        return new AssistantResponse(sb.toString(), cited, "INDICATOR_ANALYSIS", "HIGH", DISCLAIMER_TEXT);
    }

    private void checkIndicator(Boolean val, String label, List<String> active, List<String> inactive) {
        if (Boolean.TRUE.equals(val)) {
            active.add(label);
        } else if (Boolean.FALSE.equals(val)) {
            inactive.add(label + " [False]");
        } else {
            inactive.add(label + " [Not recorded]");
        }
    }

    private AssistantResponse buildEvidenceGapsResponse(CaseSnapshot c) {
        List<String> missingFields = new ArrayList<>();

        if (c.location == null || c.location.trim().isEmpty() || "Unspecified".equalsIgnoreCase(c.location)) {
            missingFields.add("Origin Jurisdiction / Location: Field not recorded in intake form.");
        }
        if (c.caseDescription == null || c.caseDescription.trim().length() < 10) {
            missingFields.add("Incident Narrative: Case description is unrecorded or brief.");
        }
        if (c.investigatorNotes == null || c.investigatorNotes.trim().isEmpty()) {
            missingFields.add("Investigator Notes: No preliminary forensic field remarks recorded.");
        }
        if (c.accountAgeDays == null) {
            missingFields.add("Account Age: Value not provided in dossier intake.");
        }
        if (c.transactionFrequency == null) {
            missingFields.add("Transaction Frequency: Value not provided in dossier intake.");
        }
        if (c.failedLoginAttempts == null) {
            missingFields.add("Authentication Attempts: Count not provided in dossier intake.");
        }

        List<String> recommendedAdditionalEvidence = List.of(
                "Network Telemetry: Originating IP address and ISP Autonomous System Number (ASN) connection headers (note: audit routing telemetry directly; do not assert proxy, VPN, or Tor routing without verified logs).",
                "Device Fingerprinting: Endpoint device certificate, TLS fingerprint, and browser agent audit trail.",
                "Counterparty Verification: Beneficiary account confirmation and KYC registration from receiving financial institution.",
                "Out-of-Band Confirmation: Identity verification challenge conducted directly with verified legal account holder via telephone or in-person protocol."
        );

        StringBuilder sb = new StringBuilder();
        sb.append("Evidence Gap Evaluation for Case ").append(c.caseId).append(":\n\n");

        sb.append("A. Confirmed Missing Intake Fields (Checked against recorded case fields):\n");
        if (!missingFields.isEmpty()) {
            for (int i = 0; i < missingFields.size(); i++) {
                sb.append("   ").append(i + 1).append(". ").append(missingFields.get(i)).append("\n");
            }
        } else {
            sb.append("   • All standard intake dossier fields have recorded values.\n");
        }

        sb.append("\nB. Recommended Additional Evidence to Collect (Follow-up investigation protocols):\n");
        for (int j = 0; j < recommendedAdditionalEvidence.size(); j++) {
            sb.append("   ").append(j + 1).append(". ").append(recommendedAdditionalEvidence.get(j)).append("\n");
        }

        List<String> cited = new ArrayList<>(missingFields);
        cited.add("Case: " + c.caseId);
        return new AssistantResponse(sb.toString(), cited, "EVIDENTIARY_GAPS", "HIGH", DISCLAIMER_TEXT);
    }

    private AssistantResponse buildNextStepsResponse(CaseSnapshot c) {
        List<String> suggestions = new ArrayList<>();

        if ("SUSPICIOUS".equalsIgnoreCase(c.prediction) || c.riskScore >= 50) {
            suggestions.add("Place a temporary administrative or operational review hold on subsequent outbound wires.");
            suggestions.add("Contact the recorded account holder via out-of-band verified communication (e.g. phone on file) to confirm transaction authorization.");
            suggestions.add("Preserve server-side authentication audit logs and TLS session headers for forensic chain-of-custody.");
            suggestions.add("Escalate case dossier to Senior Compliance Officer for formal suspicious activity reporting (SAR) triage.");
        } else {
            suggestions.add("Perform standard ledger reconciliation and record settlement in monthly accounting audit.");
            suggestions.add("Archive intake dossier in accordance with regular document retention guidelines.");
            suggestions.add("No urgent operational restriction is recommended based on currently recorded baseline evidence.");
        }

        StringBuilder sb = new StringBuilder();
        sb.append("Recommended Investigative Protocols for Case ").append(c.caseId)
                .append(" (").append(c.riskLevel).append(" Risk, ").append(c.riskScore).append("/100):\n\n");

        for (int i = 0; i < suggestions.size(); i++) {
            sb.append(i + 1).append(". ").append(suggestions.get(i)).append("\n");
        }

        sb.append("\nEvidentiary Caution: These suggestions are advisory and proportionate to the statistical risk assessment. ")
                .append("Because machine learning inferences carry statistical uncertainty, investigative actions must be grounded in verified facts ")
                .append("and authorized forensic procedures.");

        List<String> cited = new ArrayList<>(suggestions);
        cited.add("Case: " + c.caseId);
        return new AssistantResponse(sb.toString(), cited, "REMEDIATION_PROTOCOL", "HIGH", DISCLAIMER_TEXT);
    }

    private AssistantResponse buildRiskResponse(CaseSnapshot c) {
        String answer = "Risk Classification Analysis — Case " + c.caseId + ":\n\n" +
                "• Model Prediction: " + c.prediction + " (Binary classification based on 0.50 threshold)\n" +
                "• Model Probability: " + c.getFormattedProbability() + "% (Statistical likelihood of anomalous digital crime pattern)\n" +
                "• Application Risk Score: " + c.riskScore + "/100 (Derived as round(probability * 100))\n" +
                "• Application Risk Level: " + c.riskLevel + " Risk (Configured severity tier)\n\n" +
                "Documented Classification Rules:\n" +
                "- Model Probability: 0.0 to 1.0 from trained RandomForestClassifier.\n" +
                "- Application Risk Score: 0 to 100 (score = round(probability * 100)).\n" +
                "- Model Prediction: SUSPICIOUS if probability >= 0.50, otherwise NORMAL.\n" +
                "- Risk Level Thresholds: 80–100 (CRITICAL), 60–79 (HIGH), 35–59 (MEDIUM), 0–34 (LOW).\n\n" +
                "For Case " + c.caseId + ": With model probability of " + c.getFormattedProbability() + "%, " +
                "the application risk score is " + c.riskScore + "/100, which maps to " + c.riskLevel + " Risk.";

        List<String> cited = List.of(
                "Prediction: " + c.prediction,
                "Probability: " + c.getFormattedProbability() + "%",
                "Risk Score: " + c.riskScore + "/100",
                "Risk Level: " + c.riskLevel
        );

        return new AssistantResponse(answer, cited, "RISK_EVALUATION", "HIGH", DISCLAIMER_TEXT);
    }

    private AssistantResponse buildSummaryResponse(CaseSnapshot c) {
        StringBuilder sb = new StringBuilder();
        sb.append("Investigative Dossier Summary — ").append(c.caseId).append(":\n\n");
        sb.append("• Case Identifier: ").append(c.caseId).append("\n");
        sb.append("• Investigation Type: ").append(c.investigationType != null ? c.investigationType : "Not recorded").append("\n");
        sb.append("• Financial Scope: ").append(c.getFormattedAmount()).append("\n");
        sb.append("• Origin / Jurisdiction: ").append(c.location != null && !c.location.isBlank() ? c.location : "Not recorded").append("\n");
        sb.append("• Account Age: ").append(c.getFormattedAge()).append("\n");
        sb.append("• Transaction Frequency: ").append(c.getFormattedFrequency()).append("\n");
        sb.append("• Authentication Challenges: ").append(c.failedLoginAttempts != null ? c.failedLoginAttempts + " failed attempts" : "Not recorded").append("\n");

        sb.append("• Observed Indicators on Record:\n");
        List<String> activeInds = new ArrayList<>();
        if (Boolean.TRUE.equals(c.newDevice)) activeInds.add("New / Unregistered Device");
        if (Boolean.TRUE.equals(c.multipleTransfers)) activeInds.add("Multiple Concurrent Transfers");
        if (Boolean.TRUE.equals(c.unusualLocation)) activeInds.add("Unusual Geolocation");
        if (Boolean.TRUE.equals(c.previousSuspiciousActivity)) activeInds.add("Prior Suspicious Flag");
        if (Boolean.TRUE.equals(c.rapidTransfer)) activeInds.add("Rapid Velocity Transfers");

        if (!activeInds.isEmpty()) {
            for (String a : activeInds) {
                sb.append("  - ").append(a).append("\n");
            }
        } else {
            sb.append("  - None asserted on record.\n");
        }

        sb.append("• Model Classification:\n")
                .append("  - Model Prediction: ").append(c.prediction).append("\n")
                .append("  - Model Probability: ").append(c.getFormattedProbability()).append("%\n")
                .append("  - Application Risk Score: ").append(c.riskScore).append("/100\n")
                .append("  - Application Risk Level: ").append(c.riskLevel).append("\n");

        sb.append("• Incident Narrative: ").append(c.caseDescription != null && !c.caseDescription.isBlank() ? c.caseDescription : "Not provided.").append("\n");
        sb.append("• Investigator Notes: ").append(c.investigatorNotes != null && !c.investigatorNotes.isBlank() ? c.investigatorNotes : "Not recorded.");

        List<String> cited = List.of("Case: " + c.caseId, "Risk: " + c.riskLevel);
        return new AssistantResponse(sb.toString(), cited, "DOSSIER_SUMMARY", "HIGH", DISCLAIMER_TEXT);
    }

    private CaseSnapshot buildSnapshot(Map<String, Object> ctx, Optional<InvestigationCase> persisted) {
        CaseSnapshot s = new CaseSnapshot();

        // Populate from persisted if present
        if (persisted.isPresent()) {
            InvestigationCase p = persisted.get();
            s.caseId = p.getCaseId();
            s.investigationType = p.getInvestigationType();
            s.caseDescription = p.getCaseDescription();
            s.transactionAmount = p.getTransactionAmount();
            s.location = p.getLocation();
            s.accountAgeDays = p.getAccountAgeDays();
            s.transactionFrequency = p.getTransactionFrequency();
            s.failedLoginAttempts = p.getFailedLoginAttempts();
            s.newDevice = p.getNewDevice();
            s.multipleTransfers = p.getMultipleTransfers();
            s.unusualLocation = p.getUnusualLocation();
            s.previousSuspiciousActivity = p.getPreviousSuspiciousActivity();
            s.rapidTransfer = p.getRapidTransfer();
            s.investigatorNotes = p.getInvestigatorNotes();
            s.prediction = p.getPrediction();
            s.probability = p.getProbability();
            s.riskScore = p.getRiskScore();
            s.riskLevel = p.getRiskLevel();
        }

        // Apply/override from ctx
        if (ctx.containsKey("caseId") && ctx.get("caseId") != null) s.caseId = String.valueOf(ctx.get("caseId"));
        if (ctx.containsKey("investigationType") && ctx.get("investigationType") != null) s.investigationType = String.valueOf(ctx.get("investigationType"));
        if (ctx.containsKey("caseDescription") && ctx.get("caseDescription") != null) s.caseDescription = String.valueOf(ctx.get("caseDescription"));
        if (ctx.containsKey("location") && ctx.get("location") != null) s.location = String.valueOf(ctx.get("location"));
        if (ctx.containsKey("investigatorNotes") && ctx.get("investigatorNotes") != null) s.investigatorNotes = String.valueOf(ctx.get("investigatorNotes"));

        if (ctx.containsKey("transactionAmount") && ctx.get("transactionAmount") != null) {
            s.transactionAmount = parseDouble(ctx.get("transactionAmount"));
        }
        if (ctx.containsKey("accountAgeDays") && ctx.get("accountAgeDays") != null) {
            s.accountAgeDays = parseInt(ctx.get("accountAgeDays"));
        }
        if (ctx.containsKey("transactionFrequency") && ctx.get("transactionFrequency") != null) {
            s.transactionFrequency = parseInt(ctx.get("transactionFrequency"));
        }
        if (ctx.containsKey("failedLoginAttempts") && ctx.get("failedLoginAttempts") != null) {
            s.failedLoginAttempts = parseInt(ctx.get("failedLoginAttempts"));
        }

        if (ctx.containsKey("newDevice") && ctx.get("newDevice") != null) s.newDevice = parseBool(ctx.get("newDevice"));
        if (ctx.containsKey("multipleTransfers") && ctx.get("multipleTransfers") != null) s.multipleTransfers = parseBool(ctx.get("multipleTransfers"));
        if (ctx.containsKey("unusualLocation") && ctx.get("unusualLocation") != null) s.unusualLocation = parseBool(ctx.get("unusualLocation"));
        if (ctx.containsKey("previousSuspiciousActivity") && ctx.get("previousSuspiciousActivity") != null) s.previousSuspiciousActivity = parseBool(ctx.get("previousSuspiciousActivity"));
        if (ctx.containsKey("rapidTransfer") && ctx.get("rapidTransfer") != null) s.rapidTransfer = parseBool(ctx.get("rapidTransfer"));

        // If probability or riskScore present in ctx, derive unified risk
        if (ctx.containsKey("probability") && ctx.get("probability") != null) {
            s.probability = parseDouble(ctx.get("probability"));
        }
        if (ctx.containsKey("riskScore") && ctx.get("riskScore") != null) {
            s.riskScore = parseInt(ctx.get("riskScore"));
        }
        if (ctx.containsKey("prediction") && ctx.get("prediction") != null) {
            s.prediction = String.valueOf(ctx.get("prediction"));
        }
        if (ctx.containsKey("riskLevel") && ctx.get("riskLevel") != null) {
            s.riskLevel = String.valueOf(ctx.get("riskLevel"));
        }

        // Ensure unified consistency: if probability is set, derive score, prediction, riskLevel
        if (s.probability != null) {
            RiskClassification.RiskResult classified = RiskClassification.classify(s.probability);
            s.riskScore = classified.getRiskScore();
            s.prediction = classified.getPrediction();
            s.riskLevel = classified.getRiskLevel();
        } else if (s.riskScore != null) {
            s.probability = s.riskScore / 100.0;
            RiskClassification.RiskResult classified = RiskClassification.classify(s.probability);
            s.prediction = classified.getPrediction();
            s.riskLevel = classified.getRiskLevel();
        } else {
            s.probability = 0.05;
            s.riskScore = 5;
            s.prediction = "NORMAL";
            s.riskLevel = "LOW";
        }

        return s;
    }

    private Double parseDouble(Object val) {
        if (val instanceof Number) return ((Number) val).doubleValue();
        try { return Double.parseDouble(String.valueOf(val)); } catch (Exception e) { return null; }
    }

    private Integer parseInt(Object val) {
        if (val instanceof Number) return ((Number) val).intValue();
        try { return Integer.parseInt(String.valueOf(val)); } catch (Exception e) { return null; }
    }

    private Boolean parseBool(Object val) {
        if (val instanceof Boolean) return (Boolean) val;
        return Boolean.parseBoolean(String.valueOf(val));
    }

    private static class CaseSnapshot {
        String caseId;
        String investigationType;
        String caseDescription;
        Double transactionAmount;
        String location;
        Integer accountAgeDays;
        Integer transactionFrequency;
        Integer failedLoginAttempts;
        Boolean newDevice;
        Boolean multipleTransfers;
        Boolean unusualLocation;
        Boolean previousSuspiciousActivity;
        Boolean rapidTransfer;
        String investigatorNotes;
        String prediction;
        Double probability;
        Integer riskScore;
        String riskLevel;

        boolean hasCase() {
            return caseId != null && !caseId.isBlank();
        }

        String getFormattedAmount() {
            if (transactionAmount == null) return "Not recorded";
            NumberFormat nf = NumberFormat.getCurrencyInstance(Locale.US);
            return nf.format(transactionAmount) + " USD";
        }

        String getFormattedAge() {
            return accountAgeDays != null ? accountAgeDays + " days" : "Not recorded";
        }

        String getFormattedFrequency() {
            return transactionFrequency != null ? transactionFrequency + " tx/month" : "Not recorded";
        }

        String getFormattedProbability() {
            if (probability == null) return "0.0";
            return String.format(Locale.US, "%.1f", probability * 100.0);
        }
    }
}
