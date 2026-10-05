import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, AudioLines, BookOpen, Bot, Check, CheckCircle2,
  HelpCircle, Code2, Loader2, MessageCircle, Mic, MicOff, Play, Send, Sparkles,
  Volume2, XCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCareer } from '../context/CareerContext';
import { apiRequest } from '../utils/api';
import {
  getInterviewCodingChallenge, getInterviewOutputQuestion,
  getInterviewScenario, getMockInterviewQuestions
} from '../data/mockInterviews';
import { evaluateInterviewAnswers, runInterviewCode } from '../utils/interview';
import { startDictation } from '../utils/speech';

const getGreeting = (date = new Date()) => {
  const hour = date.getHours();
  if (hour < 12) return 'good morning';
  if (hour < 17) return 'good afternoon';
  return 'good evening';
};

const getInterviewerResponse = (score) => {
  if (score >= 70) return 'That was clearly explained. You covered the important idea; let’s keep going.';
  if (score > 0) return 'You’re on the right track, and I can hear part of the idea. Let’s unpack one piece together.';
  return 'Thanks for giving that a try. There are a few ways into this topic, so let’s take the next question from a different angle.';
};

const average = (items) => items.length
  ? Math.round(items.reduce((sum, item) => sum + item, 0) / items.length)
  : 0;

const normalizeAnswer = (answer) => String(answer || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

export default function MockInterview() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentUser } = useAuth();
  const {
    selectedCareer, assessmentData, saveMockInterviewResult, mockInterviewData,
    usedInterviewIds, mockInterviewUnlocked, overallScore
  } = useCareer();
  const startFresh = searchParams.get('attempt') === 'new';
  const [result, setResult] = useState(startFresh ? null : mockInterviewData || null);
  const [stages, setStages] = useState([]);
  const [stageIndex, setStageIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [transcript, setTranscript] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceError, setVoiceError] = useState('');
  const [useTextForIntro, setUseTextForIntro] = useState(false);
  const [code, setCode] = useState('');
  const [codeResults, setCodeResults] = useState(null);
  const [isRunningCode, setIsRunningCode] = useState(false);
  const [scoreRows, setScoreRows] = useState([]);
  const [courseSaveStatus, setCourseSaveStatus] = useState('idle');
  const [courseSaveError, setCourseSaveError] = useState('');
  const [courseSaveAttempt, setCourseSaveAttempt] = useState(0);
  const recognitionRef = useRef(null);
  const messageRef = useRef(null);
  const stage = stages[stageIndex];
  const challenge = useMemo(
    () => selectedCareer ? getInterviewCodingChallenge(selectedCareer.id) : null,
    [selectedCareer]
  );
  const assessmentsPassed = [1, 2, 3].every((assessmentStage) => assessmentData[assessmentStage]?.passed);

  useEffect(() => {
    if (!selectedCareer || result) return;
    const firstName = currentUser?.name?.trim().split(/\s+/)[0] || 'there';
    const bank = getMockInterviewQuestions(selectedCareer.id);
    const used = usedInterviewIds || [];
    const available = bank.filter((question) => !used.includes(question.id));
    const pool = available.length ? available : bank;
    const firstQuestion = [...pool].sort((a, b) => a.question.length - b.question.length)[0];
    const output = getInterviewOutputQuestion();
    const welcome = `Hi ${firstName}, ${getGreeting()}! Welcome to your mock interview. Don't worry, we'll keep this simple and interactive. First, tell me about yourself.`;
    setStages([
      { id: 'introduction', type: 'introduction', category: 'hr', question: 'Tell me about yourself.' },
      { id: `technical-${firstQuestion.id}`, type: 'technical', category: 'technical', round: 1, question: firstQuestion.question, source: firstQuestion },
      { id: 'output-question', type: 'output', category: 'coding', question: output.question, ...output },
      { id: 'coding-challenge', type: 'coding', category: 'coding', question: challenge.title },
      {
        id: 'practical-scenario', type: 'scenario', category: 'scenario',
        question: getInterviewScenario(selectedCareer.id),
        expectedConcepts: ['clarify', 'investigate', 'reproduce', 'check', 'communicate', 'verify', 'measure']
      },
      { id: 'closing', type: 'closing', question: 'That’s everything I wanted to cover. Thanks for the thoughtful conversation.' }
    ]);
    setStageIndex(0);
    setCurrentAnswer('');
    setTranscript([{ role: 'interviewer', text: welcome }]);
    setScoreRows([]);
    setCode(challenge.starterCode);
    setCodeResults(null);
    setVoiceError('');
  }, [selectedCareer, currentUser?.name, challenge, usedInterviewIds, result]);

  useEffect(() => {
    messageRef.current?.scrollTo({ top: messageRef.current.scrollHeight, behavior: 'smooth' });
  }, [transcript, stageIndex]);

  useEffect(() => {
    if (!result?.passed || !assessmentsPassed || !selectedCareer) {
      setCourseSaveStatus('idle');
      setCourseSaveError('');
      return undefined;
    }

    let active = true;
    setCourseSaveStatus('saving');
    setCourseSaveError('');
    apiRequest('/api/course-results', {
      method: 'POST',
      body: {
        courseId: selectedCareer.id,
        courseName: selectedCareer.title,
        marks: overallScore
      }
    })
      .then(() => {
        if (active) setCourseSaveStatus('saved');
      })
      .catch((error) => {
        if (active) {
          setCourseSaveStatus('error');
          setCourseSaveError(error.message);
        }
      });

    return () => {
      active = false;
    };
  }, [
    result?.passed, assessmentsPassed, selectedCareer?.id, selectedCareer?.title,
    overallScore, courseSaveAttempt
  ]);

  useEffect(() => () => {
    recognitionRef.current?.stop?.();
    window.speechSynthesis?.cancel?.();
  }, []);

  if (!selectedCareer) return <Navigate to="/careers" replace />;
  if (!mockInterviewUnlocked && !(assessmentData[1]?.passed && assessmentData[2]?.passed && assessmentData[3]?.passed)) {
    return <Navigate to="/assessment" replace />;
  }

  const stopRecording = () => {
    try {
      recognitionRef.current?.stop?.();
    } catch {
      // Recognition may already have stopped.
    }
    recognitionRef.current = null;
    setIsRecording(false);
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
      return;
    }
    setVoiceError('');
    const recognition = startDictation({
      onResult: (spoken) => setCurrentAnswer((previous) => previous ? `${previous} ${spoken}` : spoken),
      onError: (message) => {
        setVoiceError(message);
        setIsRecording(false);
      },
      onEnd: () => setIsRecording(false)
    });
    if (!recognition) return;
    recognitionRef.current = recognition;
    setIsRecording(true);
  };

  const speakQuestion = () => {
    if (!window.speechSynthesis || !stage) return;
    window.speechSynthesis.cancel();
    const text = stage.type === 'introduction'
      ? transcript[0]?.text || stage.question
      : stage.question;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  const advance = (answerText, responseText) => {
    setTranscript((previous) => [
      ...previous,
      { role: 'you', text: answerText },
      { role: 'interviewer', text: responseText }
    ]);
    setCurrentAnswer('');
    setVoiceError('');
    setStageIndex((index) => index + 1);
  };

  const handleAnswer = () => {
    const answer = currentAnswer.trim();
    if (!answer) {
      setVoiceError(stage.type === 'introduction' && !useTextForIntro
        ? 'Tap the microphone and introduce yourself in your own words.'
        : 'Share a short answer before we continue.');
      return;
    }
    stopRecording();

    if (stage.type === 'technical') {
      const evaluation = evaluateInterviewAnswers([stage.source], { [stage.source.id]: answer });
      const item = evaluation.perQuestion[0];
      if (stage.followUp) {
        setScoreRows((previous) => previous.map((row) => row.id === stage.source.id && item.score > row.score
          ? { ...item, category: 'technical' }
          : row));
      } else {
        setScoreRows((previous) => [...previous, { ...item, category: 'technical' }]);
      }

      let nextTechnicalStage = null;
      if (!stage.followUp && stage.round === 1) {
        const bank = getMockInterviewQuestions(selectedCareer.id);
        const usedIds = new Set([...(usedInterviewIds || []), stage.source.id]);
        const unusedQuestions = bank.filter((question) => !usedIds.has(question.id));
        const remaining = unusedQuestions.length
          ? unusedQuestions
          : bank.filter((question) => question.id !== stage.source.id);
        if (remaining.length) {
          const nextQuestion = [...remaining].sort((a, b) => a.question.length - b.question.length);
          const adaptedQuestion = item.score >= 70 ? nextQuestion[nextQuestion.length - 1] : nextQuestion[0];
          nextTechnicalStage = {
            id: `technical-${adaptedQuestion.id}`,
            type: 'technical',
            category: 'technical',
            round: 2,
            question: adaptedQuestion.question,
            source: adaptedQuestion
          };
        }
      }

      if (!stage.followUp && item.score > 0 && item.score < 70) {
        const concept = item.missed[0] || stage.source.expectedConcepts[0];
        const followUp = {
          ...stage,
          id: `${stage.id}-follow-up`,
          followUp: true,
          question: `You have a good starting point. In simple terms, where does “${concept}” fit into this?`
        };
        setStages((previous) => [
          ...previous.slice(0, stageIndex + 1),
          followUp,
          ...(nextTechnicalStage ? [nextTechnicalStage] : []),
          ...previous.slice(stageIndex + 1)
        ]);
        advance(answer, getInterviewerResponse(item.score));
        return;
      }

      if (!stage.followUp && stage.round === 1 && nextTechnicalStage && !(item.score > 0 && item.score < 70)) {
        setStages((previous) => [
          ...previous.slice(0, stageIndex + 1),
          nextTechnicalStage,
          ...previous.slice(stageIndex + 1)
        ]);
      }
      advance(answer, getInterviewerResponse(item.score));
      return;
    }

    if (stage.type === 'output') {
      const normalized = normalizeAnswer(answer);
      const correct = stage.expected.some((accepted) => normalizeAnswer(accepted) === normalized)
        || /^(?:(?:it )?(?:prints|outputs) |the output is )?(?:2|two)(?: items)?$/.test(normalized);
      const score = correct ? 100 : 0;
      setScoreRows((previous) => [...previous, {
        id: stage.id,
        question: stage.question,
        category: 'coding',
        score,
        matched: correct ? ['Trace array filtering'] : [],
        missed: correct ? [] : ['Trace array filtering']
      }]);
      advance(answer, correct
        ? 'Exactly. The duplicate is filtered out, so two values remain.'
        : 'The key is that filter keeps the first copy of each value here. The result has two items, so let’s try a hands-on exercise.');
      return;
    }

    if (stage.type === 'scenario') {
      const evaluation = evaluateInterviewAnswers([stage], { [stage.id]: answer });
      const item = evaluation.perQuestion[0];
      setScoreRows((previous) => [...previous, { ...item, category: 'scenario' }]);
      advance(answer, item.score >= 50
        ? 'That sounds practical. You considered how to investigate and confirm the outcome.'
        : 'Thanks. A useful approach is to clarify the impact, check the facts, and agree how you’ll verify a fix.');
      return;
    }

    advance(answer, 'Thanks for sharing that with me.');
  };

  const runCode = async () => {
    setIsRunningCode(true);
    setCodeResults(null);
    const output = await runInterviewCode(code, challenge);
    setCodeResults({ ...output, source: code });
    setIsRunningCode(false);
  };

  const handleCodeSubmit = () => {
    if (!codeResults || codeResults.source !== code) {
      setVoiceError('Run the latest version of your code before submitting.');
      return;
    }
    const passedCount = codeResults.results.filter((test) => test.passed).length;
    const score = codeResults.timedOut ? 0 : Math.round((passedCount / challenge.tests.length) * 100);
    setScoreRows((previous) => [...previous, {
      id: 'coding-challenge',
      question: challenge.title,
      category: 'coding',
      score,
      matched: codeResults.results.filter((test) => test.passed).map((test) => test.label),
      missed: codeResults.results.filter((test) => !test.passed).map((test) => test.label)
    }]);
    setVoiceError('');
    advance(`${passedCount} of ${challenge.tests.length} tests passed.`, codeResults.timedOut
      ? 'That run took too long, so I stopped it. We’ll include the result honestly and move on.'
      : passedCount === challenge.tests.length
        ? 'All test cases passed. Nice work; that is exactly how you validate a small change.'
        : `You passed ${passedCount} of ${challenge.tests.length} checks. That gives us a clear next step for practice.`);
  };

  const finishInterview = () => {
    const technicalScores = scoreRows.filter((row) => row.category === 'technical').map((row) => row.score);
    const codingScores = scoreRows.filter((row) => row.category === 'coding').map((row) => row.score);
    const scenarioScores = scoreRows.filter((row) => row.category === 'scenario').map((row) => row.score);
    const technicalPerformance = average(technicalScores);
    const codingPerformance = average(codingScores);
    const score = average([...technicalScores, ...codingScores, ...scenarioScores]);
    const concepts = scoreRows.flatMap((row) => row.matched || []);
    const strengths = [...new Set(concepts)].slice(0, 3);
    const weakAreas = [...new Set(scoreRows.flatMap((row) => row.missed || []))].slice(0, 5);
    const performanceFeedback = score >= 80
      ? `You handled this ${selectedCareer.title} conversation with confidence and showed a strong grasp of the areas we covered.`
      : score >= 60
        ? `You built a solid foundation in this ${selectedCareer.title} conversation. A little focused practice will make your explanations even clearer.`
        : `You stayed with the conversation and gave us a useful starting point. Reviewing a few core topics will help you feel more prepared next time.`;
    const evaluated = {
      score,
      passed: score >= 60,
      feedback: performanceFeedback,
      technicalPerformance,
      codingPerformance,
      strongestSkills: strengths,
      weakAreas,
      recommendations: weakAreas.length ? weakAreas : [selectedCareer.topics?.[0]?.name || selectedCareer.title],
      perQuestion: scoreRows
    };
    const questionIds = stages.map((item) => item.source?.id).filter(Boolean);
    saveMockInterviewResult(evaluated, questionIds);
    setResult(evaluated);
    setSearchParams({});
  };

  const handleRetry = () => {
    setResult(null);
    setSearchParams({ attempt: 'new' });
  };

  if (result) {
    const strengths = result.strongestSkills || [];
    const recommendations = result.recommendations || result.weakAreas || [];
    return (
      <section className="interview-shell interview-debrief mx-auto max-w-5xl pb-10">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div className="interview-debrief-copy">
            <p className="interview-eyebrow mb-2">Conversation complete</p>
            <h1 className="text-3xl font-bold text-white sm:text-4xl">Your interview debrief</h1>
            <p className="mt-2 max-w-2xl text-gray-400">A clear snapshot of what came through and what to practice next.</p>
          </div>
          <img className="interview-debrief-art" src="/images/scenes/interview-conversation.svg" alt="" aria-hidden="true" loading="lazy" />
          <span className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${result.passed ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300' : 'border-amber-300/30 bg-amber-300/10 text-amber-200'}`}>
            {result.passed ? <CheckCircle2 size={17} /> : <HelpCircle size={17} />}
            {result.passed ? 'Ready for the next step' : 'Good practice round'}
          </span>
        </header>

        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: 'Overall score', value: result.score, icon: Sparkles, tone: 'text-teal-300' },
            { label: 'Technical', value: result.technicalPerformance ?? result.score, icon: Bot, tone: 'text-sky-300' },
            { label: 'Coding', value: result.codingPerformance ?? 0, icon: Code2, tone: 'text-amber-200' }
          ].map(({ label, value, icon: Icon, tone }) => (
            <div key={label} className="interview-result-stat">
              <div className="flex items-center justify-between text-sm text-gray-400">
                {label}<Icon size={18} className={tone} />
              </div>
              <p className="mt-4 text-4xl font-semibold text-white">{value}<span className="ml-1 text-lg text-gray-500">%</span></p>
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-teal-300 to-sky-400" style={{ width: `${value}%` }} />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <article className="interview-result-panel">
            <h2 className="text-lg font-semibold text-white">A note from your interviewer</h2>
            <p className="mt-3 leading-7 text-gray-300">{result.feedback}</p>
            <div className="mt-7 grid gap-6 sm:grid-cols-2">
              <div>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-emerald-200">Strongest skills</h3>
                {strengths.length ? <ul className="space-y-2 text-sm text-gray-300">{strengths.map((item) => <li key={item} className="flex gap-2"><Check size={16} className="mt-0.5 shrink-0 text-emerald-300" />{item}</li>)}</ul> : <p className="text-sm text-gray-400">Keep practicing; your next round can help these strengths emerge.</p>}
              </div>
              <div>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-amber-200">Skills to improve</h3>
                {result.weakAreas?.length ? <ul className="space-y-2 text-sm text-gray-300">{result.weakAreas.map((item) => <li key={item} className="flex gap-2"><HelpCircle size={16} className="mt-0.5 shrink-0 text-amber-200" />{item}</li>)}</ul> : <p className="text-sm text-gray-400">No missed concepts in the scored questions.</p>}
              </div>
            </div>
          </article>
          <aside className="interview-result-panel">
            <h2 className="text-lg font-semibold text-white">Good topics to practice</h2>
            <ul className="mt-4 space-y-3">
              {recommendations.map((item) => <li key={item} className="flex items-start gap-3 text-sm text-gray-300"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-300" />{item}</li>)}
            </ul>
            <Link to="/learning" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-teal-200 hover:text-white">
              <BookOpen size={17} /> Explore learning topics <ArrowRight size={16} />
            </Link>
          </aside>
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          {result.passed && assessmentsPassed && (
            <div className="w-full text-right text-sm" role={courseSaveStatus === 'error' ? 'alert' : 'status'}>
              {courseSaveStatus === 'saving' && <span className="text-gray-400">Saving your verified course result…</span>}
              {courseSaveStatus === 'saved' && <span className="text-emerald-300">Course result saved to your profile.</span>}
              {courseSaveStatus === 'error' && (
                <span className="text-rose-300">
                  {courseSaveError}{' '}
                  <button type="button" className="underline" onClick={() => setCourseSaveAttempt((attempt) => attempt + 1)}>
                    Retry saving
                  </button>
                </span>
              )}
            </div>
          )}
          <button onClick={handleRetry} className="interview-secondary-button"><Play size={16} /> Try another round</button>
          {result.passed && <button onClick={() => navigate('/certificate')} className="interview-primary-button">Continue to certificate <ArrowRight size={17} /></button>}
          {!result.passed && <button onClick={() => navigate('/skill-analysis')} className="interview-secondary-button">View skill analysis <ArrowRight size={17} /></button>}
        </div>
      </section>
    );
  }

  if (!stage) {
    return <div className="interview-loading flex min-h-[55vh] items-center justify-center"><Loader2 className="mr-3 animate-spin text-teal-300" />Preparing your interview…</div>;
  }

  const progress = Math.round(((stageIndex + 1) / stages.length) * 100);
  const isAnswerStage = ['introduction', 'technical', 'output', 'scenario'].includes(stage.type);
  const canUseVoice = stage.type !== 'output';

  return (
    <section className="interview-shell interview-session mx-auto flex min-h-[min(820px,calc(100vh-8rem))] max-w-6xl flex-col pb-6">
      <header className="interview-heading mb-5">
        <div className="interview-heading-top">
          <button onClick={() => navigate('/assessment')} aria-label="Back to assessment" className="interview-icon-button"><ArrowLeft size={19} /></button>
          <p className="interview-eyebrow">CareerAI <span aria-hidden="true">·</span> Practice room</p>
          <span className="interview-career-tag">{selectedCareer.title}</span>
        </div>
        <div className="interview-heading-copy">
          <div>
            <h1>AI Mock <span>Interview</span></h1>
            <p>A friendly space to think out loud, share what you know, and grow more confident.</p>
          </div>
          <div className="interview-session-status">
            <span aria-hidden="true" />
            Friendly practice session
          </div>
        </div>
      </header>

      <div className="interview-progress-row mb-4" role="progressbar" aria-label="Interview progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
        <span>Step {stageIndex + 1} <span aria-hidden="true">/</span> {stages.length}</span>
        <div className="interview-progress-track"><div style={{ width: `${progress}%` }} /></div>
        <span>{progress}%</span>
      </div>

      <div className="interview-room grid min-h-0 flex-1">
        <aside className="interview-art-panel" aria-hidden="true">
          <div className="interview-art-glow" />
          <img src="/images/scenes/assessment-student.png" alt="" />
          <p>One step at a time</p>
          <span>You’ve got this.</span>
        </aside>

        <main className="interview-conversation flex min-h-[560px] flex-col">
          <div ref={messageRef} className="interview-thread flex-1 space-y-5 overflow-y-auto p-4 sm:p-7" aria-live="polite">
            {transcript.map((line, index) => (
              <div key={`${line.role}-${index}`} className={`interview-rise flex gap-3 ${line.role === 'you' ? 'justify-end' : ''}`}>
                {line.role !== 'you' && <span className="interview-avatar"><Bot size={18} /></span>}
                <p className={`max-w-[86%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-6 ${line.role === 'you' ? 'rounded-tr-sm bg-teal-400/15 text-teal-50' : 'rounded-tl-sm border border-white/[0.07] bg-white/[0.045] text-gray-300'}`}>{line.text}</p>
              </div>
            ))}

            {stage.type === 'closing' ? (
              <div className="interview-current-prompt interview-rise">
                <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-200"><Sparkles size={15} /> Wrap-up</div>
                <h2 className="text-xl font-semibold leading-snug text-white">{stage.question}</h2>
                <p className="mt-3 text-sm leading-6 text-gray-400">You’ve made it through the introduction, role questions, a code exercise, and a practical scenario. Your feedback is ready whenever you are.</p>
                <button onClick={finishInterview} className="interview-primary-button mt-6">See my feedback <ArrowRight size={17} /></button>
              </div>
            ) : (
              <div className="interview-current-prompt interview-rise">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-200">
                    {stage.type === 'introduction' ? 'Warm-up' : stage.type === 'coding' || stage.type === 'output' ? 'Hands-on' : stage.type === 'scenario' ? 'Real-world scenario' : 'Role question'}
                    <span className="h-1 w-1 rounded-full bg-teal-200/50" /> One question at a time
                  </span>
                  <button type="button" onClick={speakQuestion} title="Read question aloud" aria-label="Read question aloud" className="interview-icon-button h-9 w-9"><Volume2 size={17} /></button>
                </div>
                <h2 className="text-xl font-semibold leading-snug text-white sm:text-2xl">{stage.type === 'coding' ? challenge.title : stage.question}</h2>

                {stage.type === 'output' && <div className="interview-code mt-5"><div className="mb-3 flex items-center gap-2 text-xs text-gray-500"><Code2 size={15} /> JavaScript · predict the output</div><pre className="overflow-x-auto text-sm leading-6 text-sky-100"><code>{stage.code}</code></pre></div>}

                {stage.type === 'coding' && (
                  <div className="mt-5 space-y-4">
                    <p className="text-sm leading-6 text-gray-400">{challenge.instructions}</p>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-gray-400" htmlFor="interview-code">Your solution · JavaScript</label>
                      <span className="text-[11px] text-gray-500">Tab to indent · Ctrl+Enter to run</span>
                    </div>
                    <textarea
                      id="interview-code"
                      value={code}
                      onChange={(event) => { setCode(event.target.value); setCodeResults(null); }}
                      onKeyDown={(event) => {
                        if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
                          event.preventDefault();
                          runCode();
                        } else if (event.key === 'Tab') {
                          event.preventDefault();
                          const target = event.currentTarget;
                          const start = target.selectionStart;
                          const end = target.selectionEnd;
                          setCode(`${code.slice(0, start)}  ${code.slice(end)}`);
                          setCodeResults(null);
                          requestAnimationFrame(() => target.setSelectionRange(start + 2, start + 2));
                        }
                      }}
                      spellCheck="false"
                      className="interview-code-editor min-h-52 w-full resize-y rounded-xl p-4 font-mono text-sm leading-6 text-emerald-100 outline-none focus:border-teal-300/60"
                    />
                    <div className="flex flex-wrap items-center gap-3">
                      <button type="button" onClick={runCode} disabled={isRunningCode} className="interview-secondary-button disabled:cursor-wait disabled:opacity-60">
                        {isRunningCode ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}{isRunningCode ? 'Running tests…' : 'Run code'}
                      </button>
                      <button type="button" onClick={handleCodeSubmit} disabled={!codeResults || codeResults.source !== code || isRunningCode} className="interview-primary-button disabled:cursor-not-allowed disabled:opacity-40"><Send size={16} /> Submit</button>
                      <span className="text-xs text-gray-500">{challenge.tests.length} test cases · 1.5s run limit</span>
                    </div>
                    {codeResults && <div className="space-y-2 rounded-xl border border-white/[0.08] bg-black/15 p-3" aria-live="polite">
                      {codeResults.timedOut && <p className="text-sm text-amber-200">Execution timed out. Check for a loop that does not finish.</p>}
                      {codeResults.results.map((test) => <div key={test.label} className="flex items-center gap-2 text-sm"><span className={test.passed ? 'text-emerald-300' : 'text-rose-300'}>{test.passed ? <CheckCircle2 size={16} /> : <XCircle size={16} />}</span><span className="text-gray-300">{test.label}</span>{test.error && <span className="truncate text-xs text-rose-200">{test.error}</span>}</div>)}
                    </div>}
                  </div>
                )}

                {isAnswerStage && <div className="mt-5 space-y-3">
                  {stage.type === 'introduction' && !useTextForIntro && <p className="text-sm text-gray-400">No need to rehearse a perfect answer. A few sentences about your background and interests is plenty.</p>}
                  {stage.type !== 'introduction' && stage.type !== 'output' && <p className="text-sm text-gray-400">A short answer is enough. Use your own words; you can speak or type.</p>}
                  {stage.type === 'output' ? <input aria-label="Your predicted output" value={currentAnswer} onChange={(event) => setCurrentAnswer(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') handleAnswer(); }} placeholder="Your predicted output" maxLength={100} className="interview-answer-input w-full" /> : (
                    <div className="flex items-end gap-2">
                      {canUseVoice && <button type="button" onClick={toggleRecording} title={isRecording ? 'Stop speech input' : 'Answer with your voice'} aria-label={isRecording ? 'Stop speech input' : 'Answer with your voice'} className={`interview-mic-button ${isRecording ? 'is-recording' : ''}`}>
                        {isRecording ? <MicOff size={19} /> : <Mic size={19} />}
                      </button>}
                      {(stage.type !== 'introduction' || useTextForIntro) && <textarea aria-label={stage.type === 'introduction' ? 'Your introduction' : 'Your answer'} value={currentAnswer} onChange={(event) => setCurrentAnswer(event.target.value)} placeholder={isRecording ? 'Listening… speak naturally.' : 'Share a few thoughts…'} rows={2} maxLength={600} className="interview-answer-input min-h-14 flex-1 resize-y" />}
                      {stage.type === 'introduction' && !useTextForIntro && <div className={`flex min-h-14 flex-1 items-center gap-3 rounded-xl border px-4 text-sm ${isRecording ? 'border-rose-300/30 bg-rose-400/10 text-rose-100' : 'border-white/10 bg-white/[0.035] text-gray-400'}`}>
                        <AudioLines size={18} className={isRecording ? 'animate-pulse text-rose-200' : 'text-teal-200'} />
                        {isRecording ? 'I’m listening. Take your time…' : 'Tap the microphone when you’re ready'}
                      </div>}
                      {stage.type === 'introduction' && !useTextForIntro && <button type="button" onClick={() => setUseTextForIntro(true)} className="px-2 pb-3 text-xs text-gray-400 underline decoration-white/20 underline-offset-4 hover:text-white">Use text</button>}
                    </div>
                  )}
                  {canUseVoice && stage.type !== 'introduction' && <p className="text-xs text-gray-500">Microphone works best in Chrome or Edge. Your speech is transcribed in this browser.</p>}
                  {voiceError && <p role="alert" className="text-sm text-rose-300">{voiceError}</p>}
                  <button type="button" onClick={handleAnswer} className="interview-primary-button"><Send size={16} /> Continue conversation <ArrowRight size={16} /></button>
                </div>}
              </div>
            )}
          </div>
        </main>

        <aside className="interview-sidebar">
          <div className="interview-tips-heading">
            <span><Sparkles size={17} /></span>
            <div><h2>Interview tips</h2><p>A few gentle reminders</p></div>
          </div>
          <ul className="interview-tip-list">
            <li><span className="interview-tip-icon is-blue"><MessageCircle size={17} /></span><span><strong>Be clear</strong><small>Organize your thoughts one idea at a time.</small></span></li>
            <li><span className="interview-tip-icon is-yellow"><BookOpen size={17} /></span><span><strong>Use real examples</strong><small>Connect your answer to something you’ve done.</small></span></li>
            <li><span className="interview-tip-icon is-mint"><CheckCircle2 size={17} /></span><span><strong>Trust your experience</strong><small>Your own words are more than enough.</small></span></li>
            <li><span className="interview-tip-icon is-lilac"><AudioLines size={17} /></span><span><strong>Take your time</strong><small>Pause, then start when you feel ready.</small></span></li>
          </ul>

          <div className="interview-sidebar-divider" />
          <p className="interview-sidebar-label">Today’s flow</p>
          <ol className="interview-flow-list">
            {[
              ['Introduction', 'introduction'], ['Role questions', 'technical'], ['Code output', 'output'],
              ['Coding challenge', 'coding'], ['Practical scenario', 'scenario'], ['Friendly close', 'closing']
            ].map(([label, id], index) => {
              const current = stage.type === id || (stage.type === 'technical' && id === 'technical');
              const complete = stageIndex > stages.findIndex((item) => item.type === id);
              return <li key={id} className={current ? 'is-current' : complete ? 'is-complete' : ''}>
                <span>{complete ? <Check size={12} /> : index + 1}</span>{label}
              </li>;
            })}
          </ol>
          {mockInterviewData && <p className="interview-previous-round">Previous round: <strong>{mockInterviewData.score}%</strong> · this practice uses unused role questions when available.</p>}
        </aside>
      </div>
    </section>
  );
}
