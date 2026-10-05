import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ArrowRight, Award, Bot, CheckCircle2, LockKeyhole, Play, RotateCcw } from 'lucide-react';
import { useCareer } from '../context/CareerContext';
import LockedAction from '../components/common/LockedAction';

const stageDetails = [
  { id: 1, title: 'Foundation', description: 'Check core concepts and build a knowledge baseline.' },
  { id: 2, title: 'Practical', description: 'Apply your knowledge to tools and common tasks.' },
  { id: 3, title: 'Simulation', description: 'Work through role-specific scenarios and decisions.' }
];

export default function Assessment() {
  const {
    selectedCareer, assessmentData, mockInterviewData, mockInterviewUnlocked,
    stage2Unlocked, stage3Unlocked
  } = useCareer();
  if (!selectedCareer) return <Navigate to="/careers" replace />;

  const featureList = [
    { label: 'Role-based Questions', icon: <CheckCircle2 size={16} /> },
    { label: 'Adaptive Difficulty', icon: <Award size={16} /> },
    { label: 'Identify Skill Gaps', icon: <Bot size={16} /> },
    { label: 'Get Certified', icon: <CheckCircle2 size={16} /> }
  ];

  return (
    <div className="career-user-app assessment-hub">
      <header className="assessment-hero-panel">
        <div className="assessment-hero-copy">
          <p className="assessment-kicker">Evidence-based evaluation</p>
          <h1>Assessment workspace</h1>
          <p>
            Three role-specific stages for {selectedCareer.title}. Questions come from the existing skill bank,
            and later stages adapt toward skills you missed.
          </p>
        </div>

        <div className="assessment-hero-art" aria-hidden="true">
          <div className="assessment-floating-orbit orbit-one" />
          <div className="assessment-floating-orbit orbit-two" />
          <div className="assessment-hero-tag tag-one">Role-based</div>
          <div className="assessment-hero-tag tag-two">Skill gaps</div>
          <img src="/images/scenes/assessment-student.png" alt="" />
        </div>
      </header>

      <div className="assessment-feature-row" aria-label="Assessment features">
        {featureList.map((feature) => (
          <div key={feature.label} className="assessment-feature-pill">
            <span>{feature.icon}</span>
            <span>{feature.label}</span>
          </div>
        ))}
      </div>

      <section className="assessment-stage-grid" aria-label="Assessment stages">
        {stageDetails.map((stage) => {
          const data = assessmentData[stage.id];
          const unlocked = stage.id === 1 || (stage.id === 2 ? stage2Unlocked : stage3Unlocked);
          const unlockRequirement = stage.id === 3
            ? 'Pass Stages 1 and 2 to unlock'
            : `Pass Stage ${stage.id - 1} to unlock`;
          const action = data?.passed ? 'Retake to improve' : data ? 'Retry stage' : 'Start stage';

          return (
            <article
              key={stage.id}
              className={`assessment-stage-card ${data?.passed ? 'is-passed' : data && unlocked ? 'is-retry' : ''} ${!unlocked ? 'is-locked' : ''}`}
            >
              <div className="assessment-stage-header-row">
                <span className={`assessment-stage-number ${data?.passed ? 'is-passed' : ''}`}>
                  {data?.passed ? <CheckCircle2 size={17} /> : stage.id}
                </span>
                {data && <span className={`assessment-stage-score ${data.passed ? 'is-passed' : 'is-retry'}`}>{data.score}%</span>}
                {!unlocked && <LockKeyhole size={16} className="assessment-stage-lock" />}
              </div>

              <p className="assessment-stage-label">Stage {stage.id}</p>
              <h2>{stage.title}</h2>
              <p className="assessment-stage-description">{stage.description}</p>

              {data && (
                <div className="assessment-stage-progress-wrap">
                  <div className="assessment-progress-track">
                    <span className={data.passed ? 'is-passed' : 'is-retry'} style={{ width: `${data.score}%` }} />
                  </div>
                  <p>{data.passed ? 'Requirement met · 60%' : 'Retry available · pass at 60%'}</p>
                </div>
              )}

              {unlocked ? (
                <Link to={`/assessment/${stage.id}`} className="assessment-stage-action">
                  {data ? <RotateCcw size={15} /> : <Play size={15} />}
                  <span>{action}</span>
                  <ArrowRight size={14} />
                </Link>
              ) : (
                <LockedAction requirement={`${unlockRequirement} ${stage.title}.`}>
                  {unlockRequirement}
                </LockedAction>
              )}
            </article>
          );
        })}
      </section>

      <section className={`assessment-interview-panel ${!mockInterviewUnlocked ? 'is-locked' : ''}`}>
        <span className="assessment-interview-icon"><Bot size={22} /></span>
        <div className="assessment-interview-copy">
          <p>Final conversation</p>
          <h2>Mock interview</h2>
          <p>A friendly, role-specific conversation before your Digital Skill Passport.</p>
        </div>
        {mockInterviewData && (
          <span className={`assessment-stage-score ${mockInterviewData.passed ? 'is-passed' : 'is-retry'}`}>
            {mockInterviewData.score}%
          </span>
        )}
        {mockInterviewUnlocked ? (
          <Link to={mockInterviewData ? '/mock-interview?attempt=new' : '/mock-interview'} className="assessment-stage-action">
            <span>{mockInterviewData?.passed ? 'Practice again' : mockInterviewData ? 'Retry interview' : 'Start interview'}</span>
            <ArrowRight size={15} />
          </Link>
        ) : (
          <LockedAction requirement="Pass the Foundation, Practical, and Simulation assessment stages to unlock the mock interview.">
            Pass all three stages first
          </LockedAction>
        )}
      </section>

      {mockInterviewData?.passed && (
        <section className="assessment-complete-banner">
          <Award size={20} />
          <div className="assessment-complete-copy">
            <h2>Passport requirements complete</h2>
            <p>All assessments and the mock interview are passed. Your Digital Skill Passport is ready.</p>
          </div>
          <Link to="/certificate" className="learning-primary-button">
            View passport <ArrowRight size={15} />
          </Link>
        </section>
      )}
    </div>
  );
}
