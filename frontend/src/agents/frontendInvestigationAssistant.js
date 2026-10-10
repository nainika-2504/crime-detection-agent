/**
 * Frontend AI Investigation Assistant Engine
 * Transparent, evidence-correlating analytical engine adhering strictly to ethical investigative norms.
 * Grounded in case parameters, indicator weights, risk calculations and verifiable audit logs.
 */

export function analyzeEvidenceQuestion(question, caseContext) {
  if (!caseContext) {
    return {
      answer: "No active case dossier is currently loaded into the investigation desk. Please submit or select a case dossier first to evaluate the evidence.",
      evidenceCited: [],
      investigativeStage: "INITIAL_DISCOVERY",
      confidence: "NOT_APPLICABLE",
      disclaimer: "Statistical inferences do not constitute definitive proof of criminal activity."
    };
  }

  const q = question.toLowerCase();
  const {
    caseId,
    investigationType,
    caseDescription,
    transactionAmount,
    location,
    accountAgeDays,
    transactionFrequency,
    failedLoginAttempts,
    newDevice,
    multipleTransfers,
    unusualLocation,
    previousSuspiciousActivity,
    rapidTransfer,
    prediction,
    probability,
    riskScore,
    riskLevel,
    explanation,
    recommendedChecks
  } = caseContext;

  const cited = [];

  // 1. "Why was this case flagged?"
  if (q.includes('why') || q.includes('flagged') || q.includes('cause') || q.includes('reason')) {
    if (prediction === 'SUSPICIOUS') {
      const reasons = [];
      if (previousSuspiciousActivity) {
        reasons.push("Entity has prior recorded suspicious incidents on file (+18% risk weight).");
        cited.push("previousSuspiciousActivity = true");
      }
      if (Number(failedLoginAttempts) >= 3) {
        reasons.push(`${failedLoginAttempts} failed credential challenges occurred prior to the transaction, indicating potential brute-force or credential stuffing.`);
        cited.push(`failedLoginAttempts = ${failedLoginAttempts}`);
      }
      if (unusualLocation) {
        reasons.push(`Geographic routing (${location || 'Unspecified'}) deviates from baseline access profile.`);
        cited.push(`location = ${location}`);
      }
      if (rapidTransfer) {
        reasons.push("Burst velocities indicate immediate liquidation attempts typical of account takeover or smurfing.");
        cited.push("rapidTransfer = true");
      }
      if (Number(accountAgeDays) < 60) {
        reasons.push(`Account maturity is low (${accountAgeDays} days), which elevates default synthetic identity risk.`);
        cited.push(`accountAgeDays = ${accountAgeDays}`);
      }
      if (newDevice) {
        reasons.push("Access originated from an unrecognized browser environment and unverified hardware fingerprint.");
        cited.push("newDevice = true");
      }

      const answer = `Case ${caseId} was flagged as SUSPICIOUS with a model risk score of ${riskScore}/100 (probability: ${(probability * 100).toFixed(1)}%). Primary contributing factors include:\n\n` +
        reasons.map((r, i) => `${i + 1}. ${r}`).join('\n\n') +
        `\n\nSynthesized assessment: The combination of authentication anomalies alongside rapid financial structuring significantly exceeds established fraud tolerances.`;

      return {
        answer,
        evidenceCited: cited,
        investigativeStage: "PRIMARY_TRIAGE",
        confidence: `${(probability * 100).toFixed(1)}%`,
        disclaimer: "Statistical inferences do not constitute definitive proof of criminal activity."
      };
    } else {
      return {
        answer: `Case ${caseId} was NOT flagged as suspicious. The machine learning model evaluated the transaction parameters and classified the activity as NORMAL with a probability of ${((1 - probability) * 100).toFixed(1)}% normalcy (risk score: ${riskScore}/100).\n\nKey stabilizing evidence:\n- Authentication challenges: 0 or within normal threshold (${failedLoginAttempts || 0})\n- Account maturity: ${accountAgeDays} days in good standing\n- Hardware and geolocation match established baselines.`,
        evidenceCited: [`riskScore = ${riskScore}`, `prediction = NORMAL`],
        investigativeStage: "CLEARED_TRIAGE",
        confidence: "HIGH",
        disclaimer: "Statistical inferences do not constitute definitive proof of criminal activity."
      };
    }
  }

  // 2. "Which indicators contributed to the risk assessment?"
  if (q.includes('indicator') || q.includes('contribute') || q.includes('factor') || q.includes('weight')) {
    const activeIndicators = [];
    if (previousSuspiciousActivity) activeIndicators.push("Prior Suspicious Flag (Historical correlation: High)");
    if (unusualLocation) activeIndicators.push(`Anomalous Geolocation [${location}] (Geographic risk: High)`);
    if (failedLoginAttempts > 0) activeIndicators.push(`Failed Logins [${failedLoginAttempts} attempts] (Credential risk: Elevated)`);
    if (newDevice) activeIndicators.push("Unrecognized Device Hardware Fingerprint (Device binding: Unverified)");
    if (rapidTransfer) activeIndicators.push("Rapid Velocity Transfers (Structuring risk: High)");
    if (multipleTransfers) activeIndicators.push("Multiple Disbursement Endpoints (Fan-out risk: Medium)");
    if (Number(accountAgeDays) < 30) activeIndicators.push(`New Account Genesis [${accountAgeDays} days] (Maturity risk: Critical)`);

    const answer = `Detailed Breakdown of Risk Indicators for Case ${caseId}:\n\n` +
      (activeIndicators.length > 0
        ? `The following positive indicators drove the ${riskLevel} assessment:\n` + activeIndicators.map(ind => `• ${ind}`).join('\n')
        : "• No adverse indicators were asserted in the submitted case file.") +
      `\n\nOverall Model Certainty: ${(probability * 100).toFixed(1)}% likelihood of anomalous behavioral pattern.`;

    return {
      answer,
      evidenceCited: activeIndicators,
      investigativeStage: "INDICATOR_ANALYSIS",
      confidence: "HIGH",
      disclaimer: "Statistical inferences do not constitute definitive proof of criminal activity."
    };
  }

  // 3. "What information is still missing?"
  if (q.includes('missing') || q.includes('gap') || q.includes('information') || q.includes('need')) {
    const missingItems = [
      "ISP Autonomous System Number (ASN) and VPN/Proxy detection logs for the origin IP address.",
      "Beneficiary account KYC verification from counterparty financial institutions.",
      "Out-of-band communication confirmation with the verified legal entity or account holder.",
      "Device IMEI / MAC address binding logs from endpoint security telemetry."
    ];

    if (!caseDescription || caseDescription.trim().length < 20) {
      missingItems.unshift("Detailed incident narrative from the reporting compliance officer.");
    }

    const answer = `Critical Evidence Gaps for Case ${caseId}:\n\n` +
      missingItems.map((m, idx) => `${idx + 1}. ${m}`).join('\n\n') +
      `\n\nFulfilling these evidentiary requirements will ensure forensic admissibility and prevent false-positive account restriction.`;

    return {
      answer,
      evidenceCited: ["Audit completeness check"],
      investigativeStage: "EVIDENTIARY_GAPS",
      confidence: "MEDIUM",
      disclaimer: "Statistical inferences do not constitute definitive proof of criminal activity."
    };
  }

  // 4. "What should an investigator review next?"
  if (q.includes('next') || q.includes('review') || q.includes('recommend') || q.includes('action') || q.includes('step')) {
    const recs = recommendedChecks && recommendedChecks.length > 0
      ? recommendedChecks
      : [
          "Initiate temporary operational hold on outbound transfer queues.",
          "Escalate case dossier to Senior Compliance Officer.",
          "Preserve server-side TLS session logs and authentication headers."
        ];

    const answer = `Recommended Next Investigative Protocols for Case ${caseId} (${riskLevel} Risk):\n\n` +
      recs.map((r, i) => `${i + 1}. ${r}`).join('\n\n') +
      `\n\nGuideline: Ensure chain-of-custody documentation is timestamped and signed with your investigator certificate.`;

    return {
      answer,
      evidenceCited: recs,
      investigativeStage: "REMEDIATION_PROTOCOL",
      confidence: "HIGH",
      disclaimer: "Statistical inferences do not constitute definitive proof of criminal activity."
    };
  }

  // 5. "Summarize this case in plain language." or general fallback
  const summaryAnswer = `Investigative Dossier Summary — ${caseId}:\n\n` +
    `• Investigation Type: ${investigationType || 'Digital Financial Incident'}\n` +
    `• Financial Scope: $${Number(transactionAmount || 0).toLocaleString()} USD\n` +
    `• Origin/Jurisdiction: ${location || 'Unspecified'}\n` +
    `• Risk Score: ${riskScore}/100 (${riskLevel})\n` +
    `• Assessment: The model concluded that this event is ${prediction} (model probability: ${(probability * 100).toFixed(1)}%).\n\n` +
    `Narrative: ${explanation || caseDescription || 'Case submitted for automated forensic risk assessment.'}`;

  return {
    answer: summaryAnswer,
    evidenceCited: [`caseId = ${caseId}`, `transactionAmount = $${transactionAmount}`],
    investigativeStage: "DOSSIER_SUMMARY",
    confidence: "HIGH",
    disclaimer: "Statistical inferences do not constitute definitive proof of criminal activity."
  };
}
