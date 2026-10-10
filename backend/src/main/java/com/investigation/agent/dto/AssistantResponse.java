package com.investigation.agent.dto;

import java.util.List;

public class AssistantResponse {
    private String answer;
    private List<String> evidenceCited;
    private String investigativeStage;
    private String confidence;
    private String disclaimer;

    public AssistantResponse() {}

    public AssistantResponse(String answer, List<String> evidenceCited, String investigativeStage, String confidence, String disclaimer) {
        this.answer = answer;
        this.evidenceCited = evidenceCited;
        this.investigativeStage = investigativeStage;
        this.confidence = confidence;
        this.disclaimer = disclaimer;
    }

    public String getAnswer() { return answer; }
    public void setAnswer(String answer) { this.answer = answer; }

    public List<String> getEvidenceCited() { return evidenceCited; }
    public void setEvidenceCited(List<String> evidenceCited) { this.evidenceCited = evidenceCited; }

    public String getInvestigativeStage() { return investigativeStage; }
    public void setInvestigativeStage(String investigativeStage) { this.investigativeStage = investigativeStage; }

    public String getConfidence() { return confidence; }
    public void setConfidence(String confidence) { this.confidence = confidence; }

    public String getDisclaimer() { return disclaimer; }
    public void setDisclaimer(String disclaimer) { this.disclaimer = disclaimer; }
}
