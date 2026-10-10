package com.investigation.agent;

import com.investigation.agent.dto.AssistantRequest;
import com.investigation.agent.dto.AssistantResponse;
import com.investigation.agent.model.InvestigationCase;
import com.investigation.agent.service.InvestigationAssistantEngine;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

public class InvestigationAssistantEngineTest {

    private InvestigationAssistantEngine engine;

    @BeforeEach
    void setUp() {
        engine = new InvestigationAssistantEngine();
    }

    @Test
    @DisplayName("FIX 1: Greeting intent must return short, natural greeting and not generate a dossier")
    void testGreetingIntent() {
        String[] greetings = {"hi", "hello", "hey", "Hi", "Hello!", "Good morning", "greetings"};

        for (String g : greetings) {
            AssistantRequest request = new AssistantRequest();
            request.setQuestion(g);
            request.setCaseContext(Map.of("caseId", "CASE-2026-9041")); // even if case is loaded!

            AssistantResponse response = engine.processInquiry(request, Optional.empty());

            assertNotNull(response);
            assertEquals("GREETING", response.getInvestigativeStage());
            assertTrue(response.getEvidenceCited().isEmpty(), "Greeting should not cite evidentiary indicators");
            assertTrue(response.getAnswer().toLowerCase().contains("greetings, investigator"), "Greeting must be professional and courteous");
            assertTrue(response.getAnswer().contains("How may I assist"), "Should explain assistance readiness");
            assertFalse(response.getAnswer().contains("Investigative Dossier Summary"), "Greeting must not generate a full dossier");
            assertFalse(response.getAnswer().contains("CASE-2026-9041"), "Greeting must not generate case-specific output");
        }
    }

    @Test
    @DisplayName("FIX 1: Thanks and Help intents should be routed to appropriate stages")
    void testThanksAndHelpIntents() {
        AssistantRequest thanksReq = new AssistantRequest();
        thanksReq.setQuestion("Thank you!");
        AssistantResponse thanksRes = engine.processInquiry(thanksReq, Optional.empty());
        assertEquals("ACKNOWLEDGMENT", thanksRes.getInvestigativeStage());
        assertTrue(thanksRes.getAnswer().contains("You are welcome"));

        AssistantRequest helpReq = new AssistantRequest();
        helpReq.setQuestion("What can you do?");
        AssistantResponse helpRes = engine.processInquiry(helpReq, Optional.empty());
        assertEquals("GUIDANCE", helpRes.getInvestigativeStage());
        assertTrue(helpRes.getAnswer().contains("Investigation Desk Capabilities"));
    }

    @Test
    @DisplayName("FIX 2 & 4: Why was case flagged must list only observed indicators on file")
    void testWhyFlaggedUsesOnlyObservedIndicators() {
        Map<String, Object> ctx = new HashMap<>();
        ctx.put("caseId", "CASE-2026-8812");
        ctx.put("investigationType", "Account Takeover");
        ctx.put("transactionAmount", 14200.0);
        ctx.put("location", "RU (St. Petersburg)");
        ctx.put("failedLoginAttempts", 8);
        ctx.put("newDevice", true);
        ctx.put("multipleTransfers", false); // false!
        ctx.put("unusualLocation", true);
        ctx.put("previousSuspiciousActivity", false); // false!
        ctx.put("rapidTransfer", true);
        ctx.put("probability", 0.85); // 85% -> SUSPICIOUS, 85/100, CRITICAL

        AssistantRequest request = new AssistantRequest();
        request.setQuestion("Why was this case flagged?");
        request.setCaseContext(ctx);

        AssistantResponse response = engine.processInquiry(request, Optional.empty());

        assertNotNull(response);
        assertEquals("PRIMARY_TRIAGE", response.getInvestigativeStage());
        String ans = response.getAnswer();

        // Must cite the actual positive indicators
        assertTrue(ans.contains("8 failed authentication attempts"), "Must cite the 8 failed logins");
        assertTrue(ans.contains("RU (St. Petersburg)"), "Must cite the actual location");
        assertTrue(ans.contains("Rapid velocity transfers"), "Must cite rapid velocity");
        assertTrue(ans.contains("Unrecognized device"), "Must cite new device");

        // Must NOT claim previous suspicious activity was true
        assertFalse(ans.contains("Prior Suspicious Flag on record"), "Must not claim prior suspicious activity when false");
    }

    @Test
    @DisplayName("FIX 2 & 4: Evidence gaps must distinguish missing case fields from recommended follow-up evidence")
    void testEvidenceGapsDistinction() {
        Map<String, Object> ctx = new HashMap<>();
        ctx.put("caseId", "CASE-2026-TEST");
        ctx.put("location", ""); // missing!
        ctx.put("investigatorNotes", ""); // missing!
        ctx.put("caseDescription", "Short"); // brief!
        ctx.put("probability", 0.70);

        AssistantRequest request = new AssistantRequest();
        request.setQuestion("What information is missing?");
        request.setCaseContext(ctx);

        AssistantResponse response = engine.processInquiry(request, Optional.empty());

        assertNotNull(response);
        assertEquals("EVIDENTIARY_GAPS", response.getInvestigativeStage());
        String ans = response.getAnswer();

        // Confirmed missing intake fields section
        assertTrue(ans.contains("A. Confirmed Missing Intake Fields"), "Must have section A for confirmed missing intake fields");
        assertTrue(ans.contains("Origin Jurisdiction / Location: Field not recorded"), "Must identify missing location");
        assertTrue(ans.contains("Investigator Notes: No preliminary forensic field remarks recorded"), "Must identify missing notes");

        // Recommended additional evidence section
        assertTrue(ans.contains("B. Recommended Additional Evidence to Collect"), "Must have section B for recommended additional evidence");
        assertTrue(ans.contains("Network Telemetry"), "Must recommend network telemetry collection");

        // Must NOT falsely claim Tor, VPN or bulletproof hosting
        assertFalse(ans.contains("bulletproof hosting"), "Must never invent bulletproof hosting claims");
        assertFalse(ans.contains("Tor exit node"), "Must never invent Tor exit node claims without verified telemetry");
    }

    @Test
    @DisplayName("FIX 3: Risk classification consistency matches the 83% example")
    void testRiskClassificationConsistency() {
        Map<String, Object> ctx = new HashMap<>();
        ctx.put("caseId", "CASE-2026-EXAMPLE");
        ctx.put("probability", 0.83); // 83%

        AssistantRequest request = new AssistantRequest();
        request.setQuestion("Explain the risk score and classification");
        request.setCaseContext(ctx);

        AssistantResponse response = engine.processInquiry(request, Optional.empty());

        assertNotNull(response);
        assertEquals("RISK_EVALUATION", response.getInvestigativeStage());
        String ans = response.getAnswer();

        assertTrue(ans.contains("SUSPICIOUS"), "Must report model prediction SUSPICIOUS");
        assertTrue(ans.contains("83.0%"), "Must report model probability 83.0%");
        assertTrue(ans.contains("83/100"), "Must report application risk score 83/100");
        assertTrue(ans.contains("CRITICAL"), "Must report risk level CRITICAL (80..100)");
    }

    @Test
    @DisplayName("FIX 4: Next steps provides proportionate suggestions and acknowledges uncertainty")
    void testNextStepsAcknowledgesUncertainty() {
        Map<String, Object> ctx = new HashMap<>();
        ctx.put("caseId", "CASE-2026-9041");
        ctx.put("probability", 0.94);

        AssistantRequest request = new AssistantRequest();
        request.setQuestion("What should I investigate next?");
        request.setCaseContext(ctx);

        AssistantResponse response = engine.processInquiry(request, Optional.empty());

        assertNotNull(response);
        assertEquals("REMEDIATION_PROTOCOL", response.getInvestigativeStage());
        String ans = response.getAnswer();

        assertTrue(ans.contains("CRITICAL Risk, 94/100"));
        assertTrue(ans.contains("temporary administrative or operational review hold"));
        assertTrue(ans.contains("Evidentiary Caution: These suggestions are advisory"));
        assertTrue(ans.contains("statistical uncertainty"));
    }

    @Test
    @DisplayName("FIX 2: Structured summary reports Not recorded for unavailable fields")
    void testSummaryReportsNotRecordedForMissingFields() {
        Map<String, Object> ctx = new HashMap<>();
        ctx.put("caseId", "CASE-2026-SPARSE");
        // No location, no notes, no description
        ctx.put("probability", 0.20);

        AssistantRequest request = new AssistantRequest();
        request.setQuestion("Summarize this case");
        request.setCaseContext(ctx);

        AssistantResponse response = engine.processInquiry(request, Optional.empty());

        assertNotNull(response);
        assertEquals("DOSSIER_SUMMARY", response.getInvestigativeStage());
        String ans = response.getAnswer();

        assertTrue(ans.contains("Origin / Jurisdiction: Not recorded"), "Missing location must be reported as Not recorded");
        assertTrue(ans.contains("Investigator Notes: Not recorded"), "Missing notes must be reported as Not recorded");
        assertTrue(ans.contains("Incident Narrative: Not provided"), "Missing description must be reported as Not provided");
        assertTrue(ans.contains("Model Prediction: NORMAL"));
        assertTrue(ans.contains("Application Risk Score: 20/100"));
        assertTrue(ans.contains("Application Risk Level: LOW"));
    }
}
