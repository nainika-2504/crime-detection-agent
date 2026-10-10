package com.investigation.agent.controller;

import com.investigation.agent.dto.InvestigationRequest;
import com.investigation.agent.dto.InvestigationResponse;
import com.investigation.agent.service.InvestigationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class InvestigationController {

    private final InvestigationService investigationService;

    public InvestigationController(InvestigationService investigationService) {
        this.investigationService = investigationService;
    }

    @PostMapping("/investigations")
    public ResponseEntity<InvestigationResponse> createInvestigation(@RequestBody InvestigationRequest request) {
        InvestigationResponse response = investigationService.processInvestigation(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/cases")
    public ResponseEntity<List<InvestigationResponse>> getAllCases() {
        return ResponseEntity.ok(investigationService.getAllCases());
    }

    @GetMapping("/cases/summary")
    public ResponseEntity<Map<String, Object>> getSummary() {
        return ResponseEntity.ok(investigationService.getCasesSummary());
    }
}
