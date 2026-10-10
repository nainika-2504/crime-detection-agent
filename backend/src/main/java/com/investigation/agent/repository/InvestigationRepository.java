package com.investigation.agent.repository;

import com.investigation.agent.model.InvestigationCase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InvestigationRepository extends JpaRepository<InvestigationCase, Long> {
    Optional<InvestigationCase> findByCaseId(String caseId);
    List<InvestigationCase> findAllByOrderByCreatedAtDesc();
    long countByStatus(String status);
    long countByRiskLevelIn(List<String> riskLevels);
}
