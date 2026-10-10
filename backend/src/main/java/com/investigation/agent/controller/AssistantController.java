package com.investigation.agent.controller;

import com.investigation.agent.dto.AssistantRequest;
import com.investigation.agent.dto.AssistantResponse;
import com.investigation.agent.service.InvestigationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/assistant")
@CrossOrigin(origins = "*")
public class AssistantController {

    private final InvestigationService investigationService;

    public AssistantController(InvestigationService investigationService) {
        this.investigationService = investigationService;
    }

    @PostMapping
    public ResponseEntity<AssistantResponse> consultAssistant(@RequestBody AssistantRequest request) {
        AssistantResponse response = investigationService.handleAssistantInquiry(request);
        return ResponseEntity.ok(response);
    }
}
