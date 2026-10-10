package com.investigation.agent.dto;

import java.util.Map;

public class AssistantRequest {
    private String question;
    private Map<String, Object> caseContext;

    public String getQuestion() { return question; }
    public void setQuestion(String question) { this.question = question; }

    public Map<String, Object> getCaseContext() { return caseContext; }
    public void setCaseContext(Map<String, Object> caseContext) { this.caseContext = caseContext; }
}
