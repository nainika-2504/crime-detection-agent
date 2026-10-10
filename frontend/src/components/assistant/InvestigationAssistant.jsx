import React, { useState, useEffect, useRef } from 'react';
import { queryAssistant } from '../../services/api';
import { MessageSquareQuote, Send, Compass, ShieldAlert, Sparkles, HelpCircle } from 'lucide-react';

export default function InvestigationAssistant({ activeCase }) {
  const [messages, setMessages] = useState([
    {
      sender: 'agent',
      text: activeCase
        ? `Investigation Desk active for Case ${activeCase.caseId}. The evidence file has been loaded into context. How would you like to examine the findings?`
        : 'Investigation Desk ready. Submit a new investigation or select a case dossier to correlate evidence indicators.',
      cited: activeCase ? [activeCase.caseId, activeCase.investigationType] : [],
    },
  ]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const streamBottomRef = useRef(null);

  const presetQuestions = [
    'Why was this case flagged?',
    'Which indicators contributed to the risk assessment?',
    'What information is still missing?',
    'What should an investigator review next?',
    'Summarize this case in plain language.',
  ];

  useEffect(() => {
    if (activeCase) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'agent',
          text: `Loaded dossier: ${activeCase.caseId} (${activeCase.investigationType}). Risk status: ${activeCase.prediction} (${activeCase.riskScore}/100).`,
          cited: [`Case ${activeCase.caseId}`, `${activeCase.riskLevel} Risk`],
        },
      ]);
    }
  }, [activeCase]);

  useEffect(() => {
    streamBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleAsk = async (questionText) => {
    const q = questionText || inputQuestion;
    if (!q.trim() || loading) return;

    const userMsg = { sender: 'user', text: q };
    setMessages((prev) => [...prev, userMsg]);
    setInputQuestion('');
    setLoading(true);

    try {
      const response = await queryAssistant(q, activeCase);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'agent',
          text: response.answer || 'Analysis complete.',
          cited: response.evidenceCited || [],
          disclaimer: response.disclaimer,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'agent',
          text: 'Unable to correlate case evidence at this time. Please verify that the investigation case is valid.',
          cited: ['Error'],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="assistant-panel"
      data-testid="investigation-assistant"
      role="region"
      aria-label="Investigation Desk Assistant"
    >
      {/* Header */}
      <div className="assistant-header">
        <div className="assistant-title-row">
          <h2 className="assistant-title">
            <MessageSquareQuote size={20} color="var(--color-lamp-light)" />
            <span>THE INVESTIGATION DESK</span>
          </h2>
          <span className="archival-badge lamp">CASE CONSULTATION</span>
        </div>
        <p className="assistant-subtitle">Ask about the evidence.</p>
      </div>

      {/* Preset Questions Bar */}
      <div className="assistant-presets-area">
        <span className="presets-label">RECOMMENDED INQUIRIES</span>
        <div className="preset-pills-row">
          {presetQuestions.map((preset, idx) => (
            <button
              key={idx}
              className="preset-pill-btn"
              onClick={() => handleAsk(preset)}
              disabled={loading}
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Message Stream */}
      <div className="assistant-stream-area">
        {messages.map((m, idx) => (
          <div key={idx} className={`assistant-message ${m.sender}`}>
            <div className="message-sender-tag">
              {m.sender === 'agent' ? (
                <>
                  <Compass size={13} />
                  <span>INVESTIGATION INTELLIGENCE AGENT</span>
                </>
              ) : (
                <span>INVESTIGATOR INQUIRY</span>
              )}
            </div>

            <div className="message-body-text">{m.text}</div>

            {m.cited && m.cited.length > 0 && (
              <div className="evidence-cited-tag-row">
                {m.cited.map((tag, tIdx) => (
                  <span key={tIdx} className="evidence-badge">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="assistant-message agent">
            <div className="message-sender-tag">
              <Compass size={13} />
              <span>CORRELATING EVIDENCE AUDIT LOGS...</span>
            </div>
            <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.82rem' }}>
              Examining indicator weights and decision trees...
            </div>
          </div>
        )}

        <div ref={streamBottomRef} />
      </div>

      {/* Input Box */}
      <form
        className="assistant-input-box"
        onSubmit={(e) => {
          e.preventDefault();
          handleAsk();
        }}
      >
        <input
          type="text"
          className="assistant-text-field"
          value={inputQuestion}
          onChange={(e) => setInputQuestion(e.target.value)}
          placeholder="Inquire about indicators, risk score, missing evidence, or recommendations..."
          data-testid="assistant-question"
          disabled={loading}
        />
        <button
          type="submit"
          className="assistant-submit-btn"
          data-testid="assistant-submit"
          disabled={loading || !inputQuestion.trim()}
        >
          <Send size={14} />
          <span>INQUIRE</span>
        </button>
      </form>
    </div>
  );
}
