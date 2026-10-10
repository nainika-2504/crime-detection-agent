import assert from 'node:assert';
import { analyzeEvidenceQuestion, classifyRisk } from './src/agents/frontendInvestigationAssistant.js';

console.log('--- RUNNING FRONTEND INVESTIGATION ASSISTANT AGENT TESTS ---');

// 1. Test Risk Classification
console.log('Testing Risk Classification...');
const eightyThree = classifyRisk(0.83);
assert.strictEqual(eightyThree.probability, 0.83);
assert.strictEqual(eightyThree.riskScore, 83);
assert.strictEqual(eightyThree.prediction, 'SUSPICIOUS');
assert.strictEqual(eightyThree.riskLevel, 'CRITICAL');

const boundaryLow = classifyRisk(0.20);
assert.strictEqual(boundaryLow.prediction, 'NORMAL');
assert.strictEqual(boundaryLow.riskLevel, 'LOW');
assert.strictEqual(boundaryLow.riskScore, 20);

const boundaryMediumNormal = classifyRisk(0.45);
assert.strictEqual(boundaryMediumNormal.prediction, 'NORMAL');
assert.strictEqual(boundaryMediumNormal.riskLevel, 'MEDIUM');
assert.strictEqual(boundaryMediumNormal.riskScore, 45);

const boundaryMediumSuspicious = classifyRisk(0.55);
assert.strictEqual(boundaryMediumSuspicious.prediction, 'SUSPICIOUS');
assert.strictEqual(boundaryMediumSuspicious.riskLevel, 'MEDIUM');
assert.strictEqual(boundaryMediumSuspicious.riskScore, 55);

// 2. Test Greeting Intent
console.log('Testing Greeting Intent...');
const greetings = ['hi', 'hello', 'hey', 'Hi', 'Hello!', 'Good morning', 'greetings'];
for (const g of greetings) {
  const res = analyzeEvidenceQuestion(g, { caseId: 'CASE-2026-9041' });
  assert.strictEqual(res.investigativeStage, 'GREETING');
  assert.strictEqual(res.evidenceCited.length, 0);
  assert(res.answer.toLowerCase().includes('greetings, investigator'));
  assert(!res.answer.includes('CASE-2026-9041'), 'Greeting must not fabricate or output case details');
}

// Greeting even without case loaded
const greetingNoCase = analyzeEvidenceQuestion('hello', null);
assert.strictEqual(greetingNoCase.investigativeStage, 'GREETING');

// 3. Test Thanks & Help Intent
console.log('Testing Thanks & Help Intents...');
const thanksRes = analyzeEvidenceQuestion('Thank you so much', null);
assert.strictEqual(thanksRes.investigativeStage, 'ACKNOWLEDGMENT');

const helpRes = analyzeEvidenceQuestion('What can you do?', null);
assert.strictEqual(helpRes.investigativeStage, 'GUIDANCE');
assert(helpRes.answer.includes('Investigation Desk Capabilities'));

// 4. Test Why Flagged with actual case indicators
console.log('Testing Why Flagged with actual indicators...');
const testCase = {
  caseId: 'CASE-2026-8812',
  investigationType: 'Account Takeover',
  transactionAmount: 14200,
  location: 'RU (St. Petersburg)',
  failedLoginAttempts: 8,
  newDevice: true,
  multipleTransfers: false,
  unusualLocation: true,
  previousSuspiciousActivity: false,
  rapidTransfer: true,
  probability: 0.85
};

const whyFlaggedRes = analyzeEvidenceQuestion('Why was this case flagged?', testCase);
assert.strictEqual(whyFlaggedRes.investigativeStage, 'PRIMARY_TRIAGE');
assert(whyFlaggedRes.answer.includes('8 failed authentication attempts'));
assert(whyFlaggedRes.answer.includes('RU (St. Petersburg)'));
assert(whyFlaggedRes.answer.includes('Rapid velocity transfers'));
assert(!whyFlaggedRes.answer.includes('Prior Suspicious Flag on record'), 'Must not claim prior suspicious activity when false');

// 5. Test Evidence Gaps (confirms separation of missing fields vs recommended evidence)
console.log('Testing Evidence Gaps...');
const sparseCase = {
  caseId: 'CASE-SPARSE',
  location: '',
  investigatorNotes: '',
  caseDescription: '',
  probability: 0.40
};

const gapsRes = analyzeEvidenceQuestion('What information is missing?', sparseCase);
assert.strictEqual(gapsRes.investigativeStage, 'EVIDENTIARY_GAPS');
assert(gapsRes.answer.includes('A. Confirmed Missing Intake Fields'));
assert(gapsRes.answer.includes('B. Recommended Additional Evidence to Collect'));
assert(gapsRes.answer.includes('Origin Jurisdiction / Location: Field not recorded'));
assert(!gapsRes.answer.includes('bulletproof hosting'));
assert(!gapsRes.answer.includes('Tor exit node'));

// 6. Test Risk Explanation
console.log('Testing Risk Question...');
const riskRes = analyzeEvidenceQuestion('Explain the risk score', { caseId: 'CASE-83', probability: 0.83 });
assert.strictEqual(riskRes.investigativeStage, 'RISK_EVALUATION');
assert(riskRes.answer.includes('SUSPICIOUS'));
assert(riskRes.answer.includes('83.0%'));
assert(riskRes.answer.includes('83/100'));
assert(riskRes.answer.includes('CRITICAL Risk'));

console.log('--- ALL FRONTEND AGENT UNIT TESTS PASSED SUCCESSFULLY! ---');
