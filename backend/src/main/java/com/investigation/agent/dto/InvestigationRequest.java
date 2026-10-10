package com.investigation.agent.dto;

public class InvestigationRequest {
    private String caseId;
    private String investigationType;
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
    private String investigatorNotes;

    // Getters and Setters
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
}
