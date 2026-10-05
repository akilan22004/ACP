import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Award, BarChart3, BookOpen, Bot, Check, CheckCircle2,
  ChevronRight, Flame, LockKeyhole, Sparkles, Target, TrendingUp
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCareer } from '../context/CareerContext';
import { getNextJourneyStep } from '../utils/journey';
import { getLearningActivityStats, getLearningTopicProgress, getResumeTopic } from '../utils/learning';
import { topicProgressStats } from '../data/roadmaps';

const stageNames = ['Foundation', 'Practical', 'Simulation'];

export default function Dashboard() {
  const { currentUser } = useAuth();
  const {
    selectedCareer, assessmentData, mockInterviewData, certificateUnlocked,
    jobsUnlocked, readinessLevel, strongestSkill, weakestSkill, mockInterviewUnlocked,
    learningProgress, roadmapProgress, learningJourney = {}, skillScores
  } = useCareer();

  if (!selectedCareer) return (
    <section className="dashboard-empty-state">
      <div className="dashboard-empty-icon"><Target size={24} /></div>
      <p className="dashboard-eyebrow">A good place to start</p>
      <h1>Welcome, {currentUser?.name?.split(/\s+/)[0] || 'there'}.</h1>
      <p className="dashboard-empty-copy">Choose a career goal to get a focused learning path and a clear next step.</p>
      <Link to="/careers" className="dashboard-primary-link">Explore career paths <ArrowRight size={16} /></Link>
    </section>
  );

  const topicRows = selectedCareer.topics.map((topic) => {
    const legacy = topicProgressStats(topic.name, roadmapProgress[topic.id] || {});
    const progress = getLearningTopicProgress(topic.id, learningJourney, legacy.percent, legacy.complete || !!learningProgress[topic.id], selectedCareer.id);
    return { topic, progress };
  });
  const learningPercent = topicRows.length
    ? Math.round(topicRows.reduce((total, row) => total + row.progress.percent, 0) / topicRows.length)
    : 0;
  const masteredCount = topicRows.filter(({ progress }) => progress.status === 'Mastered').length;
  const resumeTopic = getResumeTopic(selectedCareer.topics, learningJourney, Object.fromEntries(topicRows.map(({ topic, progress }) => [topic.id, { percent: progress.percent, complete: progress.status === 'Mastered' }])), selectedCareer.id);
  const activity = getLearningActivityStats(learningJourney);
  const nextStep = getNextJourneyStep({ selectedCareer, learningProgress, assessmentData, mockInterviewData, jobsUnlocked, weakestSkill });
  const nextPath = nextStep.to === '/learning' && resumeTopic ? `/roadmap/${resumeTopic.id}` : nextStep.to;
  const nextTitle = nextStep.to === '/learning' && resumeTopic ? `Continue ${resumeTopic.name}` : nextStep.title;
  const attemptedStages = [1, 2, 3].filter((stage) => assessmentData[stage]);
  const passedStages = attemptedStages.filter((stage) => assessmentData[stage]?.passed).length;
  const nextAssessmentStage = [1, 2, 3].find((stage) => !assessmentData[stage]?.passed);
  const assessedSkills = Object.entries(skillScores || {}).filter(([, value]) => value.total > 0)
    .map(([skill, value]) => ({ skill, score: Math.round((value.correct / value.total) * 100), total: value.total }))
    .sort((a, b) => a.score - b.score);
  const journeyItems = [
    { id: 'learning', label: 'Learning', detail: `${Math.round(learningPercent)}% skill path progress`, complete: learningPercent === 100, icon: BookOpen, path: '/learning' },
    ...stageNames.map((label, index) => ({
      id: `stage-${index + 1}`, label: `Stage ${index + 1} · ${label}`,
      detail: assessmentData[index + 1] ? `${assessmentData[index + 1].score}% · ${assessmentData[index + 1].passed ? 'Passed' : 'Retry available'}` : 'Assessment not attempted',
      complete: !!assessmentData[index + 1]?.passed,
      locked: index > 0 && !assessmentData[index]?.passed,
      icon: CheckCircle2,
      path: `/assessment/${index + 1}`
    })),
    { id: 'interview', label: 'Mock interview', detail: mockInterviewData ? `${mockInterviewData.score}% · ${mockInterviewData.passed ? 'Passed' : 'Retry available'}` : mockInterviewUnlocked ? 'Ready to begin' : 'Pass all assessment stages to unlock', complete: !!mockInterviewData?.passed, locked: !mockInterviewUnlocked, icon: Bot, path: '/mock-interview' },
    { id: 'passport', label: 'Digital Skill Passport', detail: certificateUnlocked ? 'Eligible to issue' : 'Complete all stages and pass the interview', complete: !!jobsUnlocked, locked: !certificateUnlocked, icon: Award, path: '/certificate' }
  ];

  return (
    <div className="career-dashboard dashboard-page space-y-5 pb-10">
      <section className="dashboard-hero" aria-labelledby="dashboard-welcome-title">
        <div className="dashboard-hero-copy">
          <p className="dashboard-eyebrow"><Sparkles size={14} /> YOUR LEARNING SPACE</p>
          <h1 id="dashboard-welcome-title">Welcome back, {currentUser?.name?.split(/\s+/)[0] || 'learner'}.</h1>
          <p className="dashboard-hero-message">Keep building the skills that move you closer to your next opportunity.</p>
        </div>
        <div className="dashboard-hero-art" aria-hidden="true">
          <span className="dashboard-hero-sun" />
          <img src="/images/scenes/cheerful-student-laptop.png" alt="" />
        </div>
        <aside className="dashboard-career-card" aria-label="Current career">
          <div className="dashboard-career-icon" aria-hidden="true">{selectedCareer.icon}</div>
          <div className="dashboard-career-copy">
            <span>YOUR CURRENT CAREER</span>
            <strong>{selectedCareer.title}</strong>
            <Link to="/careers">View career details <ChevronRight size={15} /></Link>
          </div>
        </aside>
      </section>

      <section className="dashboard-metrics-grid" aria-label="Career progress summary">
        <article className="dashboard-metric dashboard-metric-learning">
          <div className="dashboard-metric-heading"><span>Learning progress</span><BookOpen size={18} aria-hidden="true" /></div>
          <strong>{learningPercent}%</strong>
          <small>{masteredCount} of {topicRows.length} skills mastered</small>
          <div className="dashboard-progress-track" role="progressbar" aria-label="Learning progress" aria-valuenow={learningPercent} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${learningPercent}%` }} /></div>
          <Link to="/learning" className="dashboard-metric-link">Open learning <ArrowRight size={14} /></Link>
        </article>
        <article className="dashboard-metric dashboard-metric-assessment">
          <div className="dashboard-metric-heading"><span>Assessment</span><Target size={18} aria-hidden="true" /></div>
          <strong>{passedStages} <span>/ 3</span></strong>
          <small>Stages passed</small>
          <div className="dashboard-progress-track" role="progressbar" aria-label="Assessment stages passed" aria-valuenow={passedStages} aria-valuemin={0} aria-valuemax={3}><span style={{ width: `${(passedStages / 3) * 100}%` }} /></div>
          <Link to={nextAssessmentStage ? `/assessment/${nextAssessmentStage}` : '/assessment'} className="dashboard-metric-link">{nextAssessmentStage ? 'Continue assessment' : 'Review assessments'} <ArrowRight size={14} /></Link>
          <span className="dashboard-metric-note">Readiness: {passedStages ? readinessLevel : attemptedStages.length ? 'In progress' : 'Not assessed'}</span>
        </article>
        <article className="dashboard-metric dashboard-metric-interview">
          <div className="dashboard-metric-heading"><span>Interview score</span><Bot size={18} aria-hidden="true" /></div>
          <strong>{mockInterviewData ? `${mockInterviewData.score}%` : 'Not taken'}</strong>
          <small>{mockInterviewData ? (mockInterviewData.passed ? 'Passed' : 'Retry available') : mockInterviewUnlocked ? 'Ready when you are' : 'Complete assessment stages to unlock'}</small>
          {mockInterviewUnlocked ? <Link to="/mock-interview" className="dashboard-metric-link">{mockInterviewData ? 'View interview' : 'Start interview'} <ArrowRight size={14} /></Link> : <span className="dashboard-metric-note">Unlock after all stages</span>}
        </article>
        <article className="dashboard-metric dashboard-metric-certificate">
          <div className="dashboard-metric-heading"><span>Certificates</span><Award size={18} aria-hidden="true" /></div>
          <strong>{certificateUnlocked ? 'Ready' : 'Locked'}</strong>
          <small>{certificateUnlocked ? 'Your Digital Skill Passport is ready' : 'Pass all stages and the interview to unlock'}</small>
          {certificateUnlocked ? <Link to="/certificate" className="dashboard-metric-link">View passport <ArrowRight size={14} /></Link> : <span className="dashboard-metric-note">No passport issued yet</span>}
        </article>
      </section>

      <section className="dashboard-feature-row" aria-label="Recommended action and learning streak">
        <article className="dashboard-next-action">
          <div className="dashboard-next-icon"><Sparkles size={20} /></div>
          <div className="dashboard-next-copy">
            <p className="dashboard-eyebrow">RECOMMENDED NEXT STEP</p>
            <h2>{nextTitle}</h2>
            <p>{nextStep.detail}</p>
            {nextStep.secondaryTo && <Link to={nextStep.secondaryTo} className="dashboard-secondary-link">{nextStep.secondaryCta} <ArrowRight size={14} /></Link>}
          </div>
          <Link to={nextPath} className="dashboard-primary-link">{nextStep.cta} <ArrowRight size={16} /></Link>
        </article>
        <aside className="dashboard-streak-card" aria-label="Daily learning streak">
          <div className="dashboard-streak-icon"><Flame size={19} aria-hidden="true" /></div>
          <p className="dashboard-eyebrow">DAILY STREAK</p>
          <div className="dashboard-streak-value"><strong>{activity.streak}</strong><span>{activity.streak === 1 ? 'day' : 'days'}</span></div>
          <p className="dashboard-streak-caption">{activity.streak ? 'Your current consecutive learning days.' : 'Complete a learning activity to start your streak.'}</p>
          <p className="dashboard-streak-total">{activity.completedActivities} activities · {activity.xp} XP earned</p>
        </aside>
      </section>

      <section className="dashboard-content-grid">
        <article className="dashboard-panel">
          <div className="mb-4 flex items-center justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Pick up where you left off</p><h2 className="mt-1 text-lg font-semibold text-white">Continue learning</h2></div><BookOpen size={19} className="text-teal-200" /></div>
          {resumeTopic ? <Link to={`/roadmap/${resumeTopic.id}`} className="dashboard-resume-card"><span className="dashboard-resume-icon">{selectedCareer.icon}</span><span className="min-w-0 flex-1"><strong>{resumeTopic.name}</strong><small>{resumeTopic.description}</small><span className="dashboard-resume-progress"><span style={{ width: `${topicRows.find((row) => row.topic.id === resumeTopic.id)?.progress.percent || 0}%` }} /></span></span><ArrowRight size={18} /></Link> : <p className="text-sm text-gray-400">Your lessons will appear here when a career path is selected.</p>}
          {strongestSkill || weakestSkill ? <div className="dashboard-skill-note"><span><TrendingUp size={15} /> Strongest: <strong>{strongestSkill || 'No results yet'}</strong></span><span><Target size={15} /> Focus: <strong>{weakestSkill || 'Keep exploring'}</strong></span></div> : <p className="mt-4 text-xs text-gray-500">Skill insights appear after a scored assessment.</p>}
        </article>

        <article className="dashboard-panel">
          <div className="mb-4 flex items-center justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Career readiness path</p><h2 className="mt-1 text-lg font-semibold text-white">Where you are now</h2></div><Link to="/assessment" className="dashboard-panel-link">Assessment hub <ArrowRight size={14} /></Link></div>
          <ol className="dashboard-journey-list">{journeyItems.map((item, index) => {
            const Icon = item.icon;
            const available = !item.locked;
            return <li key={item.id} className={`${item.complete ? 'is-complete' : ''} ${item.locked ? 'is-locked' : ''}`}><span className="dashboard-journey-marker">{item.complete ? <Check size={14} /> : item.locked ? <LockKeyhole size={13} /> : <Icon size={14} />}</span><span className="min-w-0 flex-1"><strong>{item.label}</strong><small>{item.detail}</small></span>{available && <Link to={item.path} aria-label={`Open ${item.label}`} className="dashboard-journey-open"><ArrowRight size={15} /></Link>}{index < journeyItems.length - 1 && <span className={`dashboard-journey-line ${item.complete ? 'is-complete' : ''}`} />}</li>;
          })}</ol>
        </article>
      </section>

      <section className="dashboard-bottom-grid">
        <article className="dashboard-panel"><div className="mb-4 flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Assessment evidence</p><h2 className="mt-1 text-lg font-semibold text-white">Skill signals</h2></div><BarChart3 size={19} className="text-sky-200" /></div>
          {assessedSkills.length ? <div className="space-y-3">{assessedSkills.slice(0, 4).map((item) => <div key={item.skill}><div className="mb-1.5 flex justify-between gap-3 text-xs"><span className="text-gray-300">{item.skill}</span><span className="text-gray-500">{item.score}% · {item.total} answers</span></div><div className="dashboard-skill-track"><span className={item.score < 50 ? 'needs-work' : ''} style={{ width: `${item.score}%` }} /></div></div>)}</div> : <div className="dashboard-inline-empty"><Target size={16} /><span>Complete an assessment to see evidence-based skill signals.</span></div>}
        </article>

        <article className="dashboard-panel dashboard-assessment-summary"><div><p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Assessment status</p><h2 className="mt-1 text-lg font-semibold text-white">Your latest results</h2></div>
          {[1, 2, 3].map((stage) => { const result = assessmentData[stage]; return <div className="dashboard-result-row" key={stage}><span>Stage {stage} · {stageNames[stage - 1]}</span>{result ? <strong className={result.passed ? 'text-emerald-200' : 'text-amber-200'}>{result.score}% · {result.passed ? 'Passed' : 'Retry'}</strong> : <span className="text-gray-500">Not taken</span>}</div>; })}
          <div className="dashboard-result-row"><span>Digital Skill Passport</span>{certificateUnlocked ? <Link to="/certificate" className="dashboard-panel-link">View passport <ArrowRight size={14} /></Link> : <span className="text-gray-500">{jobsUnlocked ? 'Ready' : 'Locked'}</span>}</div>
          <div className="mt-4 flex flex-wrap gap-3"><Link to="/skill-analysis" className="dashboard-panel-link">Skill analysis <ArrowRight size={14} /></Link><Link to="/jobs" className={`dashboard-panel-link ${!jobsUnlocked ? 'is-muted' : ''}`}>Job portal summary <ArrowRight size={14} /></Link></div>
        </article>
      </section>
    </div>
  );
}