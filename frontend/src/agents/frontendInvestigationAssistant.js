/**
 * Frontend AI Investigation Assistant Engine
 *
 * Implements strict forensic evidence grounding:
 * - Differentiates greetings, thanks, help requests, summaries, why-flagged inquiries,
 *   evidence gaps, next steps, and risk questions.
 * - Greetings do not trigger ML jobs or create new investigations.
 * - Strictly uses recorded case fields; never fabricates amounts, IPs, or Tor/VPN claims.
 * - Distinguishes confirmed missing intake fields from recommended follow-up evidence.
 * - Uses shared, unified risk classification rules.
 */

const DISCLAIMER_TEXT =
  "Statistical inferences do not constitute definitive proof of criminal activity. Findings must be corroborated with verified evidentiary standards.";

const GREETING_REGEX =
  /^(hi|hello|hey|greetings|howdy|hiya|good\s+(morning|afternoon|evening)|salutations)([\s!?,.]|$)/i;

const THANKS_REGEX =
  /\b(thank\s+you|thanks|much\s+appreciated|appreciate\s+it|thx)\b/i;

const HELP_REGEX =
  /\b(help|what\s+can\s+you\s+do|capabilities|commands|how\s+to\s+use|options)\b/i;

/**
 * Shared Risk Classification Rule
 * - Model Probability: [0.0, 1.0]
 * - Application Risk Score: [0, 100] derived as Math.round(probability * 100)
 * - Model Prediction: "SUSPICIOUS" if probability >= 0.50, else "NORMAL"
 * - Application Risk Level: 80..100 (CRITICAL), 60..79 (HIGH), 35..59 (MEDIUM), 0..34 (LOW)
 */
export function classifyRisk(probability) {
  const prob = Math.min(Math.max(Number(probability) || 0, 0), 1);
  const score = Math.round(prob * 100);
  const prediction = prob >= 0.5 ? 'SUSPICIOUS' : 'NORMAL';
  let riskLevel = 'LOW';
  if (score >= 80) riskLevel = 'CRITICAL';
  else if (score >= 60) riskLevel = 'HIGH';
  else if (score >= 35) riskLevel = 'MEDIUM';

  return { probability: prob, riskScore: score, prediction, riskLevel };
}

export function analyzeEvidenceQuestion(question, caseContext) {
  const q = (question || '').trim().toLowerCase();

  // 1. GREETING Intent
  if (GREETING_REGEX.test(q)) {
    return {
      answer:
        "Greetings, Investigator. I am the Investigation Assistant for this archive. " +
        "I can help you examine active case dossiers, analyze recorded evidence indicators, " +
        "explain risk scoring, identify missing data, and suggest investigative protocols. " +
        "How may I assist your inquiry today?",
      evidenceCited: [],
      investigativeStage: "GREETING",
      confidence: "NOT_APPLICABLE",
      disclaimer: DISCLAIMER_TEXT,
    };
  }

  // 2. THANKS Intent
  if (THANKS_REGEX.test(q)) {
    return {
      answer:
        "You are welcome, Investigator. The archive desk remains available if you need further examination " +
        "of this case file or additional evidence correlation.",
      evidenceCited: [],
      investigativeStage: "ACKNOWLEDGMENT",
      confidence: "NOT_APPLICABLE",
      disclaimer: DISCLAIMER_TEXT,
    };
  }

  // 3. HELP Intent
  if (HELP_REGEX.test(q)) {
    const helpText =
      "Investigation Desk Capabilities:\n\n" +
      "• Case Summaries: Ask 'Summarize this case' for a structured overview of recorded facts, scope, and classification.\n" +
      "• Flag Reasons: Ask 'Why was this case flagged?' to examine only observed indicators and their forensic relevance.\n" +
      "• Indicator Breakdown: Ask 'Which indicators contributed?' to inspect observed versus unasserted flags on record.\n" +
      "• Evidence Gaps: Ask 'What information is missing?' to check unrecorded intake fields versus recommended follow-up evidence.\n" +
      "• Investigative Next Steps: Ask 'What should I investigate next?' for proportionate verification protocols.\n" +
      "• Risk Questions: Ask 'Explain the risk score' to inspect the relationship between model probability and risk tier.";

    return {
      answer: helpText,
      evidenceCited: ["Investigation Desk Protocol"],
      investigativeStage: "GUIDANCE",
      confidence: "HIGH",
      disclaimer: DISCLAIMER_TEXT,
    };
  }

  // Require Case Context for case-specific inquiries
  if (!caseContext || !caseContext.caseId) {
    return {
      answer:
        "No active case dossier is currently loaded into the investigation desk. " +
        "Please submit an investigation form or select a case dossier from the archive to examine evidence.",
      evidenceCited: [],
      investigativeStage: "INITIAL_DISCOVERY",
      confidence: "NOT_APPLICABLE",
      disclaimer: DISCLAIMER_TEXT,
    };
  }

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
    investigatorNotes,
  } = caseContext;

  // Derive unified risk classification
  let probVal = caseContext.probability != null ? Number(caseContext.probability) : null;
  if (probVal == null && caseContext.riskScore != null) {
    probVal = Number(caseContext.riskScore) / 100;
  }
  if (probVal == null) {
    probVal = 0.05;
  }

  const { probability, riskScore, prediction, riskLevel } = classifyRisk(probVal);
  const probPercent = (probability * 100).toFixed(1);
  const formattedAmount =
    transactionAmount != null
      ? `$${Number(transactionAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`
      : 'Not recorded';
  const formattedAge = accountAgeDays != null ? `${accountAgeDays} days` : 'Not recorded';
  const formattedFreq = transactionFrequency != null ? `${transactionFrequency} tx/month` : 'Not recorded';

  // 4. WHY_FLAGGED Intent
  if (q.includes('why') || q.includes('flagged') || q.includes('cause') || q.includes('reason')) {
    const cited = [`Case: ${caseId}`];

    if (prediction === 'SUSPICIOUS' || riskScore >= 50) {
      const reasons = [];

      if (previousSuspiciousActivity) {
        reasons.push("Prior Suspicious Flag on record: Entity has documented history in the evidence ledger.");
        cited.push("previousSuspiciousActivity = true");
      }
      if (failedLoginAttempts != null && failedLoginAttempts >= 3) {
        reasons.push(`${failedLoginAttempts} failed authentication attempts recorded prior to transaction execution (authentication anomaly).`);
        cited.push(`failedLoginAttempts = ${failedLoginAttempts}`);
      } else if (failedLoginAttempts != null && failedLoginAttempts > 0) {
        reasons.push(`${failedLoginAttempts} failed authentication attempt(s) recorded.`);
        cited.push(`failedLoginAttempts = ${failedLoginAttempts}`);
      }
      if (unusualLocation) {
        const locStr = location && location.trim() ? location : 'Location not recorded';
        reasons.push(`Anomalous geolocation asserted: Originating jurisdiction (${locStr}) deviates from baseline access profile.`);
        cited.push("unusualLocation = true");
      }
      if (rapidTransfer) {
        reasons.push("Rapid velocity transfers asserted: High-frequency disbursement within a compressed timeframe.");
        cited.push("rapidTransfer = true");
      }
      if (newDevice) {
        reasons.push("Unrecognized device asserted: Access originated from an unregistered browser environment or unverified hardware.");
        cited.push("newDevice = true");
      }
      if (multipleTransfers) {
        reasons.push("Multiple concurrent transfers asserted: Fan-out disbursement across multiple disjoint beneficiary endpoints.");
        cited.push("multipleTransfers = true");
      }
      if (accountAgeDays != null && Number(accountAgeDays) < 30) {
        reasons.push(`New account genesis: Account opened ${accountAgeDays} days ago (elevated inception risk).`);
        cited.push(`accountAgeDays = ${accountAgeDays}`);
      }
      if (transactionAmount != null && Number(transactionAmount) > 50000) {
        reasons.push(`Substantial financial scope: Transaction amount of ${formattedAmount} exceeds automated monitoring threshold.`);
        cited.push(`transactionAmount = ${formattedAmount}`);
      }

      let answer = `Case ${caseId} was flagged as SUSPICIOUS with an Application Risk Score of ${riskScore}/100 ` +
        `(Model Probability: ${probPercent}%, Risk Level: ${riskLevel}).\n\n`;

      if (reasons.length > 0) {
        answer += "Contributing observed indicators present in the case record:\n" +
          reasons.map((r, i) => `${i + 1}. ${r}`).join('\n') +
          "\n\nModel Inference: The trained RandomForestClassifier correlated these specific observed evidence flags " +
          "to compute the elevated risk probability.";
      } else {
        answer += `No specific adverse indicator checkboxes were marked active in the submitted case record. ` +
          `The risk score reflects base model evaluation against the submitted numeric parameters ` +
          `(Amount: ${formattedAmount}, Account Age: ${formattedAge}, Frequency: ${formattedFreq}).`;
      }

      return {
        answer,
        evidenceCited: cited,
        investigativeStage: "PRIMARY_TRIAGE",
        confidence: `${probPercent}%`,
        disclaimer: DISCLAIMER_TEXT,
      };
    } else {
      const answer = `Case ${caseId} was NOT flagged as suspicious. The machine learning model evaluated the submitted parameters ` +
        `and classified the activity as NORMAL with a model probability of ${probPercent}% ` +
        `(Application Risk Score: ${riskScore}/100, Risk Level: ${riskLevel}).\n\n` +
        `Key stabilizing factors on record:\n` +
        `• Authentication challenges: ${failedLoginAttempts != null ? `${failedLoginAttempts} failed attempt(s)` : 'Not recorded'}.\n` +
        `• Account maturity: ${formattedAge} in standing.\n` +
        `• Hardware & location: ${newDevice ? 'New device flagged' : 'No unrecognized device flag asserted'}, ` +
        `${unusualLocation ? 'Unusual location flagged' : 'No unusual location flag asserted'}.`;

      cited.push("prediction = NORMAL", `riskScore = ${riskScore}`);
      return {
        answer,
        evidenceCited: cited,
        investigativeStage: "CLEARED_TRIAGE",
        confidence: "HIGH",
        disclaimer: DISCLAIMER_TEXT,
      };
    }
  }

  // 5. EVIDENCE_INDICATORS Intent
  if (q.includes('indicator') || q.includes('contribute') || q.includes('factor') || q.includes('weight')) {
    const activeIndicators = [];
    const inactiveIndicators = [];

    const checkInd = (val, label) => {
      if (val === true) activeIndicators.push(label);
      else if (val === false) inactiveIndicators.push(`${label} [False]`);
      else inactiveIndicators.push(`${label} [Not recorded]`);
    };

    checkInd(previousSuspiciousActivity, "Prior Suspicious Record on entity file");
    checkInd(unusualLocation, `Unusual Geolocation asserted (${location || 'Location not recorded'})`);
    checkInd(newDevice, "Unregistered Device / hardware identifier");
    checkInd(rapidTransfer, "Rapid Velocity Transfers within execution window");
    checkInd(multipleTransfers, "Multiple Concurrent Transfers across endpoints");

    let answer = `Evidence Indicator Breakdown for Case ${caseId}:\n\n` +
      `1. Active Indicators on File:\n` +
      (activeIndicators.length > 0
        ? activeIndicators.map((a) => `   • ${a}`).join('\n')
        : "   • None asserted on record.") +
      `\n\n2. Inactive / Unflagged Indicators on File:\n` +
      (inactiveIndicators.length > 0
        ? inactiveIndicators.map((ia) => `   • ${ia}`).join('\n')
        : "   • All monitored indicators were active.") +
      `\n\n3. Recorded Numeric Parameters:\n` +
      `   • Transaction Scope: ${formattedAmount}\n` +
      `   • Account Age: ${formattedAge}\n` +
      `   • Monthly Frequency: ${formattedFreq}\n` +
      `   • Failed Login Challenges: ${failedLoginAttempts != null ? failedLoginAttempts : 'Not recorded'}\n\n` +
      `Model Result: ${prediction} (Risk Score: ${riskScore}/100, ${riskLevel} Risk).`;

    const cited = [...activeIndicators, `Case: ${caseId}`];
    return {
      answer,
      evidenceCited: cited,
      investigativeStage: "INDICATOR_ANALYSIS",
      confidence: "HIGH",
      disclaimer: DISCLAIMER_TEXT,
    };
  }

  // 6. EVIDENCE_GAPS Intent
  if (q.includes('missing') || q.includes('gap') || q.includes('need') || q.includes('information')) {
    const missingFields = [];

    if (!location || !location.trim() || location.toLowerCase() === 'unspecified') {
      missingFields.push("Origin Jurisdiction / Location: Field not recorded in intake form.");
    }
    if (!caseDescription || caseDescription.trim().length < 10) {
      missingFields.push("Incident Narrative: Case description is unrecorded or brief.");
    }
    if (!investigatorNotes || !investigatorNotes.trim()) {
      missingFields.push("Investigator Notes: No preliminary forensic field remarks recorded.");
    }
    if (accountAgeDays == null) {
      missingFields.push("Account Age: Value not provided in dossier intake.");
    }
    if (transactionFrequency == null) {
      missingFields.push("Transaction Frequency: Value not provided in dossier intake.");
    }
    if (failedLoginAttempts == null) {
      missingFields.push("Authentication Attempts: Count not provided in dossier intake.");
    }

    const recommendedAdditionalEvidence = [
      "Network Telemetry: Originating IP address and ISP Autonomous System Number (ASN) connection headers (note: audit routing telemetry directly; do not assert proxy, VPN, or Tor routing without verified logs).",
      "Device Fingerprinting: Endpoint device certificate, TLS fingerprint, and browser agent audit trail.",
      "Counterparty Verification: Beneficiary account confirmation and KYC registration from receiving financial institution.",
      "Out-of-Band Confirmation: Identity verification challenge conducted directly with verified legal account holder via telephone or in-person protocol."
    ];

    let answer = `Evidence Gap Evaluation for Case ${caseId}:\n\n` +
      `A. Confirmed Missing Intake Fields (Checked against recorded case fields):\n` +
      (missingFields.length > 0
        ? missingFields.map((mf, i) => `   ${i + 1}. ${mf}`).join('\n')
        : "   • All standard intake dossier fields have recorded values.") +
      `\n\nB. Recommended Additional Evidence to Collect (Follow-up investigation protocols):\n` +
      recommendedAdditionalEvidence.map((re, j) => `   ${j + 1}. ${re}`).join('\n');

    const cited = [...missingFields, `Case: ${caseId}`];
    return {
      answer,
      evidenceCited: cited,
      investigativeStage: "EVIDENTIARY_GAPS",
      confidence: "HIGH",
      disclaimer: DISCLAIMER_TEXT,
    };
  }

  // 7. NEXT_STEPS Intent
  if (q.includes('next') || q.includes('review') || q.includes('recommend') || q.includes('action') || q.includes('step')) {
    const suggestions = [];

    if (prediction === 'SUSPICIOUS' || riskScore >= 50) {
      suggestions.push("Place a temporary administrative or operational review hold on pending outbound disbursements.");
      suggestions.push("Contact the recorded account holder via out-of-band verified communication (e.g. phone on file) to confirm transaction authorization.");
      suggestions.push("Preserve server-side authentication audit logs and TLS session headers for forensic chain-of-custody.");
      suggestions.push("Escalate case dossier to Senior Compliance Officer for formal suspicious activity reporting (SAR) triage.");
    } else {
      suggestions.push("Perform standard ledger reconciliation and record settlement in monthly accounting audit.");
      suggestions.push("Archive intake dossier in accordance with regular document retention guidelines.");
      suggestions.push("No urgent operational restriction is recommended based on currently recorded baseline evidence.");
    }

    const answer = `Recommended Investigative Protocols for Case ${caseId} (${riskLevel} Risk, ${riskScore}/100):\n\n` +
      suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n') +
      `\n\nEvidentiary Caution: These suggestions are advisory and proportionate to the statistical risk assessment. ` +
      `Because machine learning inferences carry statistical uncertainty, investigative actions must be grounded in verified facts ` +
      `and authorized forensic procedures.`;

    const cited = [...suggestions, `Case: ${caseId}`];
    return {
      answer,
      evidenceCited: cited,
      investigativeStage: "REMEDIATION_PROTOCOL",
      confidence: "HIGH",
      disclaimer: DISCLAIMER_TEXT,
    };
  }

  // 8. RISK_QUESTION Intent
  if (q.includes('risk') || q.includes('score') || q.includes('level') || q.includes('probability') || q.includes('tier')) {
    const answer = `Risk Classification Analysis — Case ${caseId}:\n\n` +
      `• Model Prediction: ${prediction} (Binary classification based on 0.50 threshold)\n` +
      `• Model Probability: ${probPercent}% (Statistical likelihood of anomalous digital crime pattern)\n` +
      `• Application Risk Score: ${riskScore}/100 (Derived as round(probability * 100))\n` +
      `• Application Risk Level: ${riskLevel} Risk (Configured severity tier)\n\n` +
      `Documented Classification Rules:\n` +
      `- Model Probability: 0.0 to 1.0 from trained RandomForestClassifier.\n` +
      `- Application Risk Score: 0 to 100 (score = round(probability * 100)).\n` +
      `- Model Prediction: SUSPICIOUS if probability >= 0.50, otherwise NORMAL.\n` +
      `- Risk Level Thresholds: 80–100 (CRITICAL), 60–79 (HIGH), 35–59 (MEDIUM), 0–34 (LOW).\n\n` +
      `For Case ${caseId}: With model probability of ${probPercent}%, the application risk score is ${riskScore}/100, which maps to ${riskLevel} Risk.`;

    const cited = [
      `Prediction: ${prediction}`,
      `Probability: ${probPercent}%`,
      `Risk Score: ${riskScore}/100`,
      `Risk Level: ${riskLevel}`,
    ];

    return {
      answer,
      evidenceCited: cited,
      investigativeStage: "RISK_EVALUATION",
      confidence: "HIGH",
      disclaimer: DISCLAIMER_TEXT,
    };
  }

  // 9. CASE_SUMMARY or Default Intent
  const activeInds = [];
  if (newDevice) activeInds.push("New / Unregistered Device");
  if (multipleTransfers) activeInds.push("Multiple Concurrent Transfers");
  if (unusualLocation) activeInds.push("Unusual Geolocation");
  if (previousSuspiciousActivity) activeInds.push("Prior Suspicious Flag");
  if (rapidTransfer) activeInds.push("Rapid Velocity Transfers");

  const summaryAnswer = `Investigative Dossier Summary — ${caseId}:\n\n` +
    `• Case Identifier: ${caseId}\n` +
    `• Investigation Type: ${investigationType || 'Not recorded'}\n` +
    `• Financial Scope: ${formattedAmount}\n` +
    `• Origin / Jurisdiction: ${location && location.trim() ? location : 'Not recorded'}\n` +
    `• Account Age: ${formattedAge}\n` +
    `• Transaction Frequency: ${formattedFreq}\n` +
    `• Authentication Challenges: ${failedLoginAttempts != null ? `${failedLoginAttempts} failed attempts` : 'Not recorded'}\n` +
    `• Observed Indicators on Record:\n` +
    (activeInds.length > 0 ? activeInds.map((a) => `  - ${a}`).join('\n') : "  - None asserted on record.") +
    `\n• Model Classification:\n` +
    `  - Model Prediction: ${prediction}\n` +
    `  - Model Probability: ${probPercent}%\n` +
    `  - Application Risk Score: ${riskScore}/100\n` +
    `  - Application Risk Level: ${riskLevel}\n` +
    `• Incident Narrative: ${caseDescription && caseDescription.trim() ? caseDescription : 'Not provided.'}\n` +
    `• Investigator Notes: ${investigatorNotes && investigatorNotes.trim() ? investigatorNotes : 'Not recorded.'}`;

  return {
    answer: summaryAnswer,
    evidenceCited: [`Case: ${caseId}`, `Risk: ${riskLevel}`],
    investigativeStage: "DOSSIER_SUMMARY",
    confidence: "HIGH",
    disclaimer: DISCLAIMER_TEXT,
  };
}
