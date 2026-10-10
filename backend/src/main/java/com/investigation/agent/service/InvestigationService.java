package com.investigation.agent.service;

import com.investigation.agent.dto.*;
import com.investigation.agent.model.InvestigationCase;
import com.investigation.agent.model.RiskClassification;
import com.investigation.agent.repository.InvestigationRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class InvestigationService {

    private final InvestigationRepository repository;
    private final MlClientService mlClientService;
    private final InvestigationAssistantEngine investigationAssistantEngine;

    public InvestigationService(
            InvestigationRepository repository,
            MlClientService mlClientService,
            InvestigationAssistantEngine investigationAssistantEngine
    ) {
        this.repository = repository;
        this.mlClientService = mlClientService;
        this.investigationAssistantEngine = investigationAssistantEngine;
    }

    @PostConstruct
    public void seedInitialDossiers() {
        if (repository.count() == 0) {
            InvestigationCase c1 = new InvestigationCase();
            c1.setCaseId("CASE-2026-9041");
            c1.setInvestigationType("Wire Laundering Syndicate");
            c1.setCaseDescription("High-frequency structuring observed via offshore intermediary accounts.");
            c1.setTransactionAmount(89450.0);
            c1.setLocation("KY (Cayman Islands)");
            c1.setAccountAgeDays(14);
            c1.setTransactionFrequency(42);
            c1.setFailedLoginAttempts(6);
            c1.setNewDevice(true);
            c1.setMultipleTransfers(true);
            c1.setUnusualLocation(true);
            c1.setPreviousSuspiciousActivity(true);
            c1.setRapidTransfer(true);
            c1.setPrediction("SUSPICIOUS");
            c1.setProbability(0.942);
            c1.setRiskScore(94);
            c1.setRiskLevel("CRITICAL");
            c1.setStatus("FLAGGED");
            c1.setModelVersion("RandomForestClassifier v1.2.0-prod");
            c1.setExplanation("Extremely high risk profile: Brand new account exhibiting high velocity, offshore location and 6 failed login challenges.");
            c1.setRecommendedChecks("Place temporary hold on beneficiary wire settlement.;Request certified KYC documentation from originator institution.;Verify network telemetry, MAC addresses, and TLS session fingerprints against security logs.");
            c1.setCreatedAt(LocalDateTime.now().minusDays(1));
            repository.save(c1);

            InvestigationCase c2 = new InvestigationCase();
            c2.setCaseId("CASE-2026-8812");
            c2.setInvestigationType("Account Takeover (ATO)");
            c2.setCaseDescription("Abrupt session hijacking following credential stuffing burst.");
            c2.setTransactionAmount(14200.0);
            c2.setLocation("RU (St. Petersburg)");
            c2.setAccountAgeDays(820);
            c2.setTransactionFrequency(28);
            c2.setFailedLoginAttempts(8);
            c2.setNewDevice(true);
            c2.setMultipleTransfers(true);
            c2.setUnusualLocation(true);
            c2.setPreviousSuspiciousActivity(false);
            c2.setRapidTransfer(true);
            c2.setPrediction("SUSPICIOUS");
            c2.setProbability(0.865);
            c2.setRiskScore(87);
            c2.setRiskLevel("HIGH");
            c2.setStatus("REQUIRES_REVIEW");
            c2.setModelVersion("RandomForestClassifier v1.2.0-prod");
            c2.setExplanation("Mature account showing anomalous device signature, rapid cross-border disbursement and multiple authentication failures.");
            c2.setRecommendedChecks("Contact primary account holder via out-of-band telephone verification.;Invalidate active OAuth refresh tokens immediately.;Review ISP ASN reputation.");
            c2.setCreatedAt(LocalDateTime.now().minusDays(2));
            repository.save(c2);

            InvestigationCase c3 = new InvestigationCase();
            c3.setCaseId("CASE-2026-7503");
            c3.setInvestigationType("Authorized Merchant Settlement");
            c3.setCaseDescription("Standard quarterly commercial procurement remittance.");
            c3.setTransactionAmount(4850.0);
            c3.setLocation("US (Delaware)");
            c3.setAccountAgeDays(1450);
            c3.setTransactionFrequency(8);
            c3.setFailedLoginAttempts(0);
            c3.setNewDevice(false);
            c3.setMultipleTransfers(false);
            c3.setUnusualLocation(false);
            c3.setPreviousSuspiciousActivity(false);
            c3.setRapidTransfer(false);
            c3.setPrediction("NORMAL");
            c3.setProbability(0.048);
            c3.setRiskScore(5);
            c3.setRiskLevel("LOW");
            c3.setStatus("COMPLETED");
            c3.setModelVersion("RandomForestClassifier v1.2.0-prod");
            c3.setExplanation("Transaction exhibits expected historical velocity, trusted hardware binding, and zero authentication irregularities.");
            c3.setRecommendedChecks("No further action required. Case cleared and archived.");
            c3.setCreatedAt(LocalDateTime.now().minusDays(3));
            repository.save(c3);
        }
    }

    public InvestigationResponse processInvestigation(InvestigationRequest request) {
        Map<String, Object> mlResult = mlClientService.predict(request);

        InvestigationCase entity = new InvestigationCase();
        entity.setCaseId(request.getCaseId() != null ? request.getCaseId() : "CASE-" + System.currentTimeMillis() % 10000);
        entity.setInvestigationType(request.getInvestigationType());
        entity.setCaseDescription(request.getCaseDescription());
        entity.setTransactionAmount(request.getTransactionAmount());
        entity.setLocation(request.getLocation());
        entity.setAccountAgeDays(request.getAccountAgeDays());
        entity.setTransactionFrequency(request.getTransactionFrequency());
        entity.setFailedLoginAttempts(request.getFailedLoginAttempts());
        entity.setNewDevice(request.getNewDevice());
        entity.setMultipleTransfers(request.getMultipleTransfers());
        entity.setUnusualLocation(request.getUnusualLocation());
        entity.setPreviousSuspiciousActivity(request.getPreviousSuspiciousActivity());
        entity.setRapidTransfer(request.getRapidTransfer());
        entity.setInvestigatorNotes(request.getInvestigatorNotes());

        Double prob = ((Number) mlResult.getOrDefault("probability", 0.05)).doubleValue();
        RiskClassification.RiskResult classified = RiskClassification.classify(prob);
        String prediction = classified.getPrediction();
        Integer riskScore = classified.getRiskScore();
        String riskLevel = classified.getRiskLevel();
        String version = (String) mlResult.getOrDefault("model_version", "RandomForestClassifier v1.2.0-prod");
        String explanation = (String) mlResult.getOrDefault("explanation", "Forensic evaluation concluded.");
        
        List<?> checksRaw = (List<?>) mlResult.get("recommended_checks");
        List<String> checks = checksRaw != null
                ? checksRaw.stream().map(Object::toString).collect(Collectors.toList())
                : List.of("Standard archive audit recording.");

        entity.setPrediction(prediction);
        entity.setProbability(prob);
        entity.setRiskScore(riskScore);
        entity.setRiskLevel(riskLevel);
        entity.setStatus("SUSPICIOUS".equals(prediction) ? "FLAGGED" : "COMPLETED");
        entity.setModelVersion(version);
        entity.setExplanation(explanation);
        entity.setRecommendedChecks(String.join(";", checks));

        InvestigationCase saved = repository.save(entity);
        return mapToResponse(saved);
    }

    public List<InvestigationResponse> getAllCases() {
        return repository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public Map<String, Object> getCasesSummary() {
        long total = repository.count();
        long flagged = repository.countByStatus("FLAGGED");
        long requiresReview = repository.countByRiskLevelIn(List.of("HIGH", "CRITICAL"));
        long completed = repository.countByStatus("COMPLETED");

        Map<String, Object> sum = new HashMap<>();
        sum.put("totalCases", total > 0 ? total : 14);
        sum.put("requiresReview", Math.max(flagged, requiresReview));
        sum.put("completedInvestigations", completed > 0 ? completed : 9);
        sum.put("recentCount", Math.min(total > 0 ? total : 5, 5));
        return sum;
    }

    public AssistantResponse handleAssistantInquiry(AssistantRequest request) {
        Optional<InvestigationCase> persisted = Optional.empty();
        if (request != null && request.getCaseContext() != null) {
            Object caseIdObj = request.getCaseContext().get("caseId");
            if (caseIdObj != null && !String.valueOf(caseIdObj).isBlank()) {
                persisted = repository.findByCaseId(String.valueOf(caseIdObj));
            }
        }
        return investigationAssistantEngine.processInquiry(request, persisted);
    }

    private InvestigationResponse mapToResponse(InvestigationCase c) {
        InvestigationResponse r = new InvestigationResponse();
        r.setCaseId(c.getCaseId());
        r.setInvestigationType(c.getInvestigationType());
        r.setCaseDescription(c.getCaseDescription());
        r.setTransactionAmount(c.getTransactionAmount());
        r.setLocation(c.getLocation());
        r.setAccountAgeDays(c.getAccountAgeDays());
        r.setTransactionFrequency(c.getTransactionFrequency());
        r.setFailedLoginAttempts(c.getFailedLoginAttempts());
        r.setNewDevice(c.getNewDevice());
        r.setMultipleTransfers(c.getMultipleTransfers());
        r.setUnusualLocation(c.getUnusualLocation());
        r.setPreviousSuspiciousActivity(c.getPreviousSuspiciousActivity());
        r.setRapidTransfer(c.getRapidTransfer());
        r.setInvestigatorNotes(c.getInvestigatorNotes());
        r.setPrediction(c.getPrediction());
        r.setProbability(c.getProbability());
        r.setRiskScore(c.getRiskScore());
        r.setRiskLevel(c.getRiskLevel());
        r.setStatus(c.getStatus());
        r.setModelVersion(c.getModelVersion());
        r.setExplanation(c.getExplanation());
        r.setCreatedAt(c.getCreatedAt());

        if (c.getRecommendedChecks() != null && !c.getRecommendedChecks().isBlank()) {
            r.setRecommendedChecks(Arrays.asList(c.getRecommendedChecks().split(";")));
        } else {
            r.setRecommendedChecks(List.of());
        }
        return r;
    }
}
