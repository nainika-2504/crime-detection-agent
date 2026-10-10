package com.investigation.agent.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "investigation_cases")
public class InvestigationCase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String caseId;

    @Column(nullable = false)
    private String investigationType;

    @Column(length = 2000)
    private String caseDescription;

    private Double transactionAmount;
    private String location;
    private Integer accountAgeDays;
    private Integer transactionFrequency;
    private Integer failedLoginAttempts;

    private Boolean newDevice;
    private Boolean multipleTransfers;
    private Boolean unusualLocation;
    private Boolean previousSuspiciousActivity;
    private Boolean rapidTransfer;

    @Column(length = 2000)
    private String investigatorNotes;

    private String prediction;
    private Double probability;
    private Integer riskScore;
    private String riskLevel;
    private String status;
    private String modelVersion;

    @Column(length = 2000)
    private String explanation;

    @Column(length = 2000)
    private String recommendedChecks;

    private LocalDateTime createdAt;

    public InvestigationCase() {
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCaseId() { return caseId; }
    public void setCaseId(String caseId) { this.caseId = caseId; }

    public String getInvestigationType() { return investigationType; }
    public void setInvestigationType(String investigationType) { this.investigationType = investigationType; }

    public String getCaseDescription() { return caseDescription; }
    public void setCaseDescription(String caseDescription) { this.caseDescription = caseDescription; }

    public Double getTransactionAmount() { return transactionAmount; }
    public void setTransactionAmount(Double transactionAmount) { this.transactionAmount = transactionAmount; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public Integer getAccountAgeDays() { return accountAgeDays; }
    public void setAccountAgeDays(Integer accountAgeDays) { this.accountAgeDays = accountAgeDays; }

    public Integer getTransactionFrequency() { return transactionFrequency; }
    public void setTransactionFrequency(Integer transactionFrequency) { this.transactionFrequency = transactionFrequency; }

    public Integer getFailedLoginAttempts() { return failedLoginAttempts; }
    public void setFailedLoginAttempts(Integer failedLoginAttempts) { this.failedLoginAttempts = failedLoginAttempts; }

    public Boolean getNewDevice() { return newDevice; }
    public void setNewDevice(Boolean newDevice) { this.newDevice = newDevice; }

    public Boolean getMultipleTransfers() { return multipleTransfers; }
    public void setMultipleTransfers(Boolean multipleTransfers) { this.multipleTransfers = multipleTransfers; }

    public Boolean getUnusualLocation() { return unusualLocation; }
    public void setUnusualLocation(Boolean unusualLocation) { this.unusualLocation = unusualLocation; }

    public Boolean getPreviousSuspiciousActivity() { return previousSuspiciousActivity; }
    public void setPreviousSuspiciousActivity(Boolean previousSuspiciousActivity) { this.previousSuspiciousActivity = previousSuspiciousActivity; }

    public Boolean getRapidTransfer() { return rapidTransfer; }
    public void setRapidTransfer(Boolean rapidTransfer) { this.rapidTransfer = rapidTransfer; }

    public String getInvestigatorNotes() { return investigatorNotes; }
    public void setInvestigatorNotes(String investigatorNotes) { this.investigatorNotes = investigatorNotes; }

    public String getPrediction() { return prediction; }
    public void setPrediction(String prediction) { this.prediction = prediction; }

    public Double getProbability() { return probability; }
    public void setProbability(Double probability) { this.probability = probability; }

    public Integer getRiskScore() { return riskScore; }
    public void setRiskScore(Integer riskScore) { this.riskScore = riskScore; }

    public String getRiskLevel() { return riskLevel; }
    public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getModelVersion() { return modelVersion; }
    public void setModelVersion(String modelVersion) { this.modelVersion = modelVersion; }

    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }

    public String getRecommendedChecks() { return recommendedChecks; }
    public void setRecommendedChecks(String recommendedChecks) { this.recommendedChecks = recommendedChecks; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
