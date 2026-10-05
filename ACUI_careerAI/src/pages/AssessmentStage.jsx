import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { useCareer } from '../context/CareerContext';
import { questions as allQuestions } from '../data/questions';
import { recommendations } from '../data/recommendations';
import { pickAdaptiveQuestions, scoreStageAttempt, analyzeSkills } from '../utils/assessment';
import { ArrowLeft, CheckCircle, XCircle, ArrowRight, RefreshCw, Bot, AlertOctagon } from 'lucide-react';

const STAGE_LABEL = { 1: 'Foundation', 2: 'Practical', 3: 'Simulation' };

export default function AssessmentStage() {
  const { stage } = useParams();
  const stageNum = parseInt(stage, 10);
  const navigate = useNavigate();
  const {
    selectedCareer,
    assessmentData,
    skillScores,
    usedQuestionIds,
    saveAssessmentResult,
    incrementWarning
  } = useCareer();

  const [stageQuestions, setStageQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [history, setHistory] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [currentWarning, setCurrentWarning] = useState(false);
  const [attemptWarnings, setAttemptWarnings] = useState(0);
  const [loadKey, setLoadKey] = useState(0);
  const [readyQuestionSetKey, setReadyQuestionSetKey] = useState('');
  const warningTimer = useRef(null);
  const threadRef = useRef(null);
  const questionSetKey = `${selectedCareer?.id || ''}:${stageNum}:${loadKey}`;

  useEffect(() => {
    if (!selectedCareer || ![1, 2, 3].includes(stageNum) || submitted) return;
    const picked = pickAdaptiveQuestions(allQuestions, {
      careerId: selectedCareer.id,
      stage: stageNum,
      skillScores,
      usedIds: usedQuestionIds?.[stageNum] || [],
      count: 5
    });
    setStageQuestions(picked);
    setReadyQuestionSetKey(questionSetKey);
    setAnswers({});
    setHistory([]);
    setCurrentIndex(0);
    setAttemptWarnings(0);
  }, [selectedCareer, stageNum, submitted, loadKey]);

  useEffect(() => {
    threadRef.current?.scrollTo?.({ top: threadRef.current.scrollHeight, behavior: 'smooth' });
  }, [history, currentIndex, currentWarning]);

  useEffect(() => {
    if (submitted) return;

    const warn = () => {
      incrementWarning();
      setAttemptWarnings((n) => n + 1);
      setCurrentWarning(true);
      clearTimeout(warningTimer.current);
      warningTimer.current = setTimeout(() => setCurrentWarning(false), 5000);
    };

    const onVisibility = () => {
      if (document.hidden) warn();
    };
    const onBlur = () => warn();
    const block = (event) => event.preventDefault();

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('blur', onBlur);
    document.addEventListener('copy', block);
    document.addEventListener('cut', block);
    document.addEventListener('paste', block);
    document.addEventListener('contextmenu', block);

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('blur', onBlur);
      document.removeEventListener('copy', block);
      document.removeEventListener('cut', block);
      document.removeEventListener('paste', block);
      document.removeEventListener('contextmenu', block);
      clearTimeout(warningTimer.current);
    };
  }, [submitted, incrementWarning]);

  if (!selectedCareer) return <Navigate to="/careers" replace />;
  if (![1, 2, 3].includes(stageNum)) return <Navigate to="/assessment" replace />;
  if (stageNum === 2 && !assessmentData[1]?.passed) return <Navigate to="/assessment" replace />;
  if (stageNum === 3 && (!assessmentData[1]?.passed || !assessmentData[2]?.passed)) {
    return <Navigate to="/assessment" replace />;
  }

  if (!submitted && readyQuestionSetKey !== questionSetKey) {
    return (
      <section className="assessment-loading-state" role="status">
        <span className="learning-loading-mark" />
        <h1 className="mt-4 text-xl font-semibold text-white">Preparing your assessment</h1>
        <p className="mt-2 max-w-sm text-center text-sm leading-6 text-gray-400">Loading the {STAGE_LABEL[stageNum]} question set for {selectedCareer.title}.</p>
        <button type="button" onClick={() => navigate('/assessment')} className="learning-secondary-button mt-5"><ArrowLeft size={15} /> Return to assessment hub</button>
      </section>
    );
  }
  if (!submitted && stageQuestions.length === 0) {
    return (
      <section className="assessment-loading-state" role="alert">
        <h1 className="mt-4 text-xl font-semibold text-white">Assessment unavailable</h1>
        <p className="mt-2 max-w-sm text-center text-sm leading-6 text-gray-400">
          The {STAGE_LABEL[stageNum]} question set for {selectedCareer.title} is not available right now.
        </p>
        <button type="button" onClick={() => navigate('/assessment')} className="learning-secondary-button mt-5"><ArrowLeft size={15} /> Return to assessment hub</button>
      </section>
    );
  }

  const currentQuestion = stageQuestions[currentIndex];

  const finishAttempt = (finalAnswers) => {
    const scored = scoreStageAttempt(stageQuestions, finalAnswers, attemptWarnings);
    const questionIds = stageQuestions.map((q) => q.id);
    saveAssessmentResult(stageNum, {
      score: scored.score,
      passed: scored.passed,
      answers: finalAnswers,
      skillScores: scored.skillScores,
      questionIds
    });
    const extremes = analyzeSkills(scored.skillScores);
    setResult({ ...scored, weakestSkill: extremes.weakestSkill, strongestSkill: extremes.strongestSkill });
    setSubmitted(true);
  };

  const handleSelect = (optIdx) => {
    if (submitted || !currentQuestion) return;
    const nextAnswers = { ...answers, [currentQuestion.id]: optIdx };
    setAnswers(nextAnswers);
    setHistory((prev) => [
      ...prev,
      { question: currentQuestion.question, answer: currentQuestion.options[optIdx], skill: currentQuestion.skill }
    ]);
    if (currentIndex < stageQuestions.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      finishAttempt(nextAnswers);
    }
  };

  const handleRetry = () => {
    setSubmitted(false);
    setResult(null);
    setLoadKey((k) => k + 1);
    window.scrollTo(0, 0);
  };

  const progress = stageQuestions.length ? Math.round((currentIndex / stageQuestions.length) * 100) : 0;

  return (
    <div className="assessment-stage-page">
      <header className="assessment-hero">
        <div className="assessment-hero-copy">
          <button type="button" onClick={() => navigate('/assessment')} className="assessment-back-link">
            <ArrowLeft size={16} aria-hidden="true" />
            Back to assessment hub
          </button>
          <p className="assessment-eyebrow"><span /> Career pathway <b>Stage {stageNum} of 3</b></p>
          <h1>Career Assessment</h1>
          <p className="assessment-hero-description">
            Build your {selectedCareer.title} skills one question at a time. Choose the answer that feels right and continue at your own pace.
          </p>
          <div className="assessment-hero-tags">
            <span>{selectedCareer.title}</span>
            <span>{STAGE_LABEL[stageNum]} stage</span>
          </div>
        </div>
        <div className="assessment-hero-art">
          <span className="assessment-art-orbit" aria-hidden="true" />
          <img src="/images/scenes/assessment-student.png" alt="Cheerful student ready to learn" />
          <span className="assessment-art-caption"><CheckCircle size={15} /> One step at a time</span>
        </div>
      </header>

      {currentWarning && (
        <div className="assessment-warning" role="alert">
          <AlertOctagon size={22} aria-hidden="true" />
          <div>
            <h2>Warning: tab switch or window blur detected</h2>
            <p>Stay on this tab. After two warnings, each extra leave deducts 5 points from this attempt. Copy, paste, and right-click are blocked.</p>
          </div>
        </div>
      )}

      {!submitted && currentQuestion && (
        <section className="assessment-workspace" aria-label="Current assessment question">
          <div className="assessment-question-card">
            <div className="assessment-question-meta">
              <span className="assessment-question-number">Question {currentIndex + 1}</span>
              <span className="assessment-topic"><span aria-hidden="true" />{currentQuestion.skill}</span>
            </div>
            <h2>{currentQuestion.question}</h2>
            <p className="assessment-question-hint">Select one answer to move to the next question.</p>
            <div className="assessment-options" role="group" aria-label="Answer choices">
              {currentQuestion.options.map((opt, optIdx) => (
                <button
                  key={`${currentQuestion.id}-${optIdx}`}
                  type="button"
                  onClick={() => handleSelect(optIdx)}
                  className="assessment-option"
                >
                  <span className="assessment-option-letter" aria-hidden="true">{String.fromCharCode(65 + optIdx)}</span>
                  <span>{opt}</span>
                  <ArrowRight className="assessment-option-arrow" size={16} aria-hidden="true" />
                </button>
              ))}
            </div>
            <p className="assessment-auto-advance"><span aria-hidden="true" /> Your answer advances immediately</p>
          </div>

          <aside className="assessment-progress-card" aria-label="Assessment progress and question details">
            <div className="assessment-progress-card-heading">
              <span className="assessment-progress-icon"><CheckCircle size={17} /></span>
              <div><h2>Your progress</h2><p>{STAGE_LABEL[stageNum]} stage</p></div>
            </div>
            <div className="assessment-progress-count">
              <strong>{currentIndex}<span> / {stageQuestions.length}</span></strong>
              <span>answered</span>
            </div>
            <div className="assessment-progress-track" role="progressbar" aria-label="Questions answered" aria-valuemin="0" aria-valuemax={stageQuestions.length} aria-valuenow={currentIndex}>
              <span style={{ width: `${progress}%` }} />
            </div>
            <div className="assessment-progress-caption">
              <span>{currentIndex} completed</span><span>{stageQuestions.length} total</span>
            </div>
            <div className="assessment-question-steps" aria-label={`Question ${currentIndex + 1} of ${stageQuestions.length}`}>
              {stageQuestions.map((question, index) => (
                <span
                  key={question.id}
                  className={index < currentIndex ? 'is-complete' : index === currentIndex ? 'is-current' : ''}
                  aria-current={index === currentIndex ? 'step' : undefined}
                />
              ))}
            </div>
            <div className="assessment-detail-row">
              <span>Current topic</span>
              <strong>{currentQuestion.skill || 'Not specified'}</strong>
            </div>
            <div className="assessment-detail-row">
              <span>Career path</span>
              <strong>{selectedCareer.title}</strong>
            </div>
          </aside>
          <div className="sr-only" aria-live="polite">Question {currentIndex + 1} of {stageQuestions.length}</div>
        </section>
      )}

      {submitted && result && (
        <section className={`assessment-result-card ${result.passed ? 'is-passed' : 'is-failed'}`}>
          {result.passed ? (
            <>
              <div className="assessment-result-icon"><CheckCircle size={38} /></div>
              <h2>Stage passed</h2>
              <p className="assessment-result-score">Score: {result.score}%</p>
              <p className="assessment-result-copy">
                {result.correctCount} of {stageQuestions.length} correct
                {result.penalty > 0 ? ` · −${result.penalty} tab-switch penalty` : ''}
              </p>
              <div className="assessment-result-note">
                <Bot size={19} aria-hidden="true" />
                <p>Strongest skill this round: <strong>{result.strongestSkill || 'balanced'}</strong>. Retrying uses unused questions when available and does not reset later stages you already passed.</p>
              </div>
              <div className="assessment-result-actions">
                <button type="button" onClick={() => navigate('/assessment')} className="assessment-secondary-action">Back to hub</button>
                {stageNum < 3 ? (
                  <button type="button" onClick={() => {
                    setSubmitted(false);
                    setResult(null);
                    setStageQuestions([]);
                    setCurrentIndex(0);
                    setAnswers({});
                    setHistory([]);
                    setLoadKey((key) => key + 1);
                    navigate(`/assessment/${stageNum + 1}`);
                  }} className="assessment-primary-action">
                    Next stage <ArrowRight size={17} />
                  </button>
                ) : (
                  <button type="button" onClick={() => navigate('/skill-analysis')} className="assessment-primary-action">
                    View skill analysis <ArrowRight size={17} />
                  </button>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="assessment-result-icon"><XCircle size={38} /></div>
              <h2>Stage not passed</h2>
              <p className="assessment-result-score">Score: {result.score}% <span>(need 60%)</span></p>
              {result.penalty > 0 && <p className="assessment-result-copy is-penalty">This score includes a {result.penalty} point tab-switch penalty.</p>}
              {result.weakestSkill && (
                <div className="assessment-result-note is-weak-skill">
                  <Bot size={19} aria-hidden="true" />
                  <div>
                    <h3>Weakest skill: {result.weakestSkill}</h3>
                    <p>Later stages will ask more about this area. Review it, then retry with a different question set. Other stages you already passed stay saved.</p>
                    <ul>
                      {(recommendations[result.weakestSkill] || [`Review ${result.weakestSkill} fundamentals`]).map((rec, i) => <li key={i}>{rec}</li>)}
                    </ul>
                  </div>
                </div>
              )}
              <div className="assessment-result-actions">
                <button type="button" onClick={() => navigate('/learning')} className="assessment-secondary-action">Recommended learning</button>
                <button type="button" onClick={handleRetry} className="assessment-primary-action">
                  <RefreshCw size={16} /> Retry with other questions
                </button>
              </div>
            </>
          )}
        </section>
      )}
    </div>
  );
}
