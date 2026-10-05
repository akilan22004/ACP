import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  ArrowRight, BarChart3, BookOpen, Bot, CheckCircle2, ChevronRight,
  ClipboardCheck, Compass, Gauge, HelpCircle, Lightbulb, Sparkles, Target
} from 'lucide-react';
import { useCareer } from '../context/CareerContext';
import { recommendations } from '../data/recommendations';
import { topicProgressStats } from '../data/roadmaps';
import { getLearningTopicProgress } from '../utils/learning';

const stageLabels = ['Foundation', 'Practical', 'Simulation'];

export default function SkillAnalysis() {
  const {
    selectedCareer, assessmentData, mockInterviewData, skillScores,
    overallScore, readinessLevel, strongestSkill, weakestSkill, jobsUnlocked,
    learningProgress, roadmapProgress, learningJourney = {}
  } = useCareer();

  if (!selectedCareer) return <Navigate to="/careers" replace />;

  const skillData = Object.entries(skillScores || {}).filter(([, data]) => data.total > 0)
    .map(([skill, data]) => ({
      skill,
      score: Math.round((data.correct / data.total) * 100),
      correct: data.correct,
      total: data.total
    }))
    .sort((a, b) => a.score - b.score);
  const completedStages = [1, 2, 3].filter((stage) => assessmentData[stage]?.passed).length;
  const allStagesPassed = completedStages === stageLabels.length;
  const topicProgress = selectedCareer.topics.map((topic) => {
    const legacy = topicProgressStats(topic.name, roadmapProgress[topic.id] || {});
    return getLearningTopicProgress(
      topic.id,
      learningJourney,
      legacy.percent,
      legacy.complete || !!learningProgress[topic.id],
      selectedCareer.id
    );
  });
  const learningPercent = topicProgress.length
    ? Math.round(topicProgress.reduce((sum, item) => sum + item.percent, 0) / topicProgress.length)
    : 0;
  const stageRows = [1, 2, 3]
    .filter((stage) => assessmentData[stage])
    .map((stage) => ({ label: stageLabels[stage - 1], ...assessmentData[stage] }));
  const showEmpty = !skillData.length && !stageRows.length && !mockInterviewData;
  const lowestSkill = skillData.find((item) => item.skill === weakestSkill) || skillData[0];
  const interviewWeakAreas = [...new Set(
    Array.isArray(mockInterviewData?.weakAreas) ? mockInterviewData.weakAreas.filter(Boolean) : []
  )];
  const interviewUnlocked = allStagesPassed;

  return (
    <div className="analytics-page space-y-6 pb-10">
      <header className="analytics-heading">
        <div className="analytics-hero-copy">
          <p className="analytics-eyebrow"><Sparkles size={14} aria-hidden="true" /> YOUR CAREER SNAPSHOT</p>
          <h1>Understand Your<br /><span>Skills</span></h1>
          <p className="analytics-hero-description">
            Get AI-powered insights about your strengths, weaknesses and improvement areas.
          </p>
          <p className="analytics-career-context">
            Your evidence for <strong>{selectedCareer.title}</strong>
          </p>
        </div>
        <div className="analytics-hero-art">
          <span className="analytics-orbit analytics-orbit-one" aria-hidden="true" />
          <span className="analytics-orbit analytics-orbit-two" aria-hidden="true" />
          <span className="analytics-spark analytics-spark-one" aria-hidden="true">✦</span>
          <span className="analytics-spark analytics-spark-two" aria-hidden="true">✳</span>
          <img
            src="/images/scenes/learning-student.png"
            alt="Student learning on a laptop beside a stack of books"
            fetchpriority="high"
          />
        </div>
      </header>

      {showEmpty ? (
        <section className="analytics-empty-state" aria-labelledby="analytics-empty-title">
          <span><Compass size={22} aria-hidden="true" /></span>
          <div>
            <p className="analytics-section-kicker">Your starting point</p>
            <h2 id="analytics-empty-title">Your baseline is ready to build</h2>
            <p>Complete an assessment stage to see skill-level evidence and a focused study recommendation here.</p>
          </div>
          <Link to="/assessment" className="learning-primary-button">
            Open assessments <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </section>
      ) : (
        <>
          <section className="analytics-overview-grid" aria-label="Skill overview and readiness">
            <article className="analytics-panel analytics-skill-overview" aria-labelledby="analytics-skills-title">
              <div className="analytics-card-heading">
                <div>
                  <p className="analytics-section-kicker">Scored question evidence</p>
                  <h2 id="analytics-skills-title">Skill Overview</h2>
                </div>
                <span className="analytics-heading-icon analytics-icon-blue"><BarChart3 size={19} aria-hidden="true" /></span>
              </div>
              {skillData.length ? (
                <div className="analytics-skill-list">
                  {skillData.map((item, index) => (
                    <div className="analytics-skill-row" key={item.skill}>
                      <span className={`analytics-skill-icon analytics-tone-${index % 4}`}>
                        <Target size={17} aria-hidden="true" />
                      </span>
                      <div className="analytics-skill-content">
                        <div className="analytics-skill-label">
                          <span>{item.skill}</span>
                          <strong>{item.score}%</strong>
                        </div>
                        <div
                          className="analytics-skill-track"
                          role="progressbar"
                          aria-label={`${item.skill} assessment score`}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-valuenow={item.score}
                          aria-valuetext={`${item.score} percent, ${item.correct} of ${item.total} correct`}
                        >
                          <span className={item.score < 50 ? 'is-retry' : item.score >= 80 ? 'is-strong' : ''} style={{ width: `${item.score}%` }} />
                        </div>
                        <small>{item.correct} of {item.total} answers correct</small>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="analytics-inline-empty">
                  <HelpCircle size={18} aria-hidden="true" />
                  <p>Skill-level results will appear after you complete an assessment.</p>
                  <Link to="/assessment">Take an assessment <ArrowRight size={14} aria-hidden="true" /></Link>
                </div>
              )}
              {strongestSkill && (
                <p className="analytics-strongest-skill"><CheckCircle2 size={15} aria-hidden="true" /> Strongest so far: <strong>{strongestSkill}</strong></p>
              )}
            </article>

            <div className="analytics-side-stack">
              <article className={`analytics-panel analytics-readiness-panel ${completedStages ? 'has-readiness' : 'is-unassessed'}`} aria-labelledby="analytics-readiness-title">
                <div className="analytics-card-heading">
                  <div>
                    <p className="analytics-section-kicker">Assessment readiness</p>
                    <h2 id="analytics-readiness-title">Overall Readiness</h2>
                  </div>
                  <span className="analytics-heading-icon analytics-icon-mint"><Gauge size={19} aria-hidden="true" /></span>
                </div>
                {completedStages ? (
                  <div className="analytics-readiness-value">
                    <span className="analytics-score-ring" style={{ '--score': `${overallScore}%` }} role="img" aria-label={`Readiness score ${overallScore} out of 100`}>
                      <span><strong>{overallScore}</strong><small>/100</small></span>
                    </span>
                    <div>
                      <strong className="analytics-readiness-level">{readinessLevel}</strong>
                      <p>{completedStages} of 3 assessment stages passed</p>
                    </div>
                  </div>
                ) : (
                  <div className="analytics-unassessed">
                    <span><ClipboardCheck size={20} aria-hidden="true" /></span>
                    <div>
                      <strong>Not assessed yet</strong>
                      <p>Readiness appears after you pass an assessment stage.</p>
                    </div>
                    <Link to="/assessment" aria-label="Go to assessments to measure career readiness">
                      Start an assessment <ArrowRight size={15} aria-hidden="true" />
                    </Link>
                  </div>
                )}
              </article>

              <article className="analytics-panel analytics-action-panel" aria-labelledby="analytics-improvement-title">
                <div className="analytics-card-heading">
                  <div>
                    <p className="analytics-section-kicker">A thoughtful next step</p>
                    <h2 id="analytics-improvement-title">Improvement Areas</h2>
                  </div>
                  <span className="analytics-heading-icon analytics-icon-peach"><Lightbulb size={19} aria-hidden="true" /></span>
                </div>
                {lowestSkill || interviewWeakAreas.length ? (
                  <div className="analytics-improvement-content">
                    {lowestSkill && (
                      <div className="analytics-focus-skill">
                        <span>Lowest scored skill</span>
                        <strong>{lowestSkill.skill}</strong>
                        <small>{lowestSkill.score}% · {lowestSkill.correct} of {lowestSkill.total} correct</small>
                      </div>
                    )}
                    {interviewWeakAreas.length > 0 && (
                      <div className="analytics-weak-area-group">
                        <span className="analytics-improvement-label">Interview practice topics</span>
                        <div className="analytics-weak-area-chips">
                          {interviewWeakAreas.slice(0, 5).map((area) => <span key={area}>{area}</span>)}
                        </div>
                      </div>
                    )}
                    {lowestSkill && (
                      <>
                        <p className="analytics-improvement-copy">Build confidence in your lowest-scored assessed skill with a focused review.</p>
                        <div className="analytics-recommendation-list">
                          {(recommendations[lowestSkill.skill] || [`Review ${lowestSkill.skill} fundamentals`])
                            .slice(0, 2)
                            .map((item) => (
                              <div key={item} className="analytics-recommendation-row">
                                <span>{item}</span><ChevronRight size={15} aria-hidden="true" />
                              </div>
                            ))}
                        </div>
                        <Link to="/learning" className="analytics-text-link">
                          Explore learning <ArrowRight size={15} aria-hidden="true" />
                        </Link>
                      </>
                    )}
                    {!lowestSkill && interviewWeakAreas.length > 0 && (
                      <p className="analytics-improvement-copy">These topics were missed in your saved interview responses. Review them, then practice again.</p>
                    )}
                  </div>
                ) : (
                  <div className="analytics-inline-empty analytics-improvement-empty">
                    <p>Complete a scored assessment or mock interview to identify a specific area to work on.</p>
                    <Link to="/assessment">Build your baseline <ArrowRight size={14} aria-hidden="true" /></Link>
                  </div>
                )}
              </article>
            </div>
          </section>

          <section className="analytics-detail-grid" aria-label="Assessment and learning details">
            <article className="analytics-panel analytics-stage-panel" aria-labelledby="analytics-stage-title">
              <div className="analytics-card-heading">
                <div>
                  <p className="analytics-section-kicker">Your assessment path</p>
                  <h2 id="analytics-stage-title">Stage scores</h2>
                  <p className="analytics-records-caption">Latest saved score for each stage; attempt history isn’t stored.</p>
                </div>
                <span className="analytics-heading-icon analytics-icon-blue"><ClipboardCheck size={19} aria-hidden="true" /></span>
              </div>
              <div className="analytics-stage-list">
                {stageLabels.map((label, index) => {
                  const result = assessmentData[index + 1];
                  return (
                    <div className="analytics-stage-row" key={label}>
                      <div className="analytics-stage-label">
                        <span>{label}</span>
                        <strong className={result ? result.passed ? 'is-passed' : 'is-retry' : 'is-pending'}>
                          {result ? `${result.score}% · ${result.passed ? 'Passed' : 'Retry'}` : 'Not attempted'}
                        </strong>
                      </div>
                      {result ? (
                        <div className="analytics-skill-track analytics-stage-track" role="progressbar" aria-label={`${label} assessment score`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={result.score}>
                          <span className={result.passed ? 'is-strong' : 'is-retry'} style={{ width: `${result.score}%` }} />
                        </div>
                      ) : <div className="analytics-stage-not-attempted">Assessment not yet attempted</div>}
                    </div>
                  );
                })}
              </div>
              <div className="analytics-learning-progress">
                <div className="analytics-learning-heading">
                  <span><BookOpen size={16} aria-hidden="true" /> Learning path completion</span>
                  <strong>{learningPercent}%</strong>
                </div>
                <div className="analytics-skill-track" role="progressbar" aria-label="Learning path completion" aria-valuemin={0} aria-valuemax={100} aria-valuenow={learningPercent}>
                  <span className="is-learning" style={{ width: `${learningPercent}%` }} />
                </div>
                <p>Learning progress is separate from assessment readiness.</p>
              </div>
              {jobsUnlocked && (
                <p className="analytics-certificate-link">
                  <CheckCircle2 size={15} aria-hidden="true" /> Certificate requirements are met.
                  <Link to="/certificate">View your passport <ArrowRight size={14} aria-hidden="true" /></Link>
                </p>
              )}
            </article>

            <article className="analytics-panel analytics-interview-panel" aria-labelledby="analytics-interview-title">
              <div className="analytics-card-heading">
                <div>
                  <p className="analytics-section-kicker">Interview assessment</p>
                  <h2 id="analytics-interview-title">Mock interview</h2>
                </div>
                <span className="analytics-heading-icon analytics-icon-lilac"><Bot size={19} aria-hidden="true" /></span>
              </div>
              {mockInterviewData ? (
                <>
                  <div className="analytics-interview-score">
                    <strong>{mockInterviewData.score}<span>/100</span></strong>
                    <span className={mockInterviewData.passed ? 'is-passed' : 'is-retry'}>
                      {mockInterviewData.passed ? 'Passed' : 'Practice again when ready'}
                    </span>
                  </div>
                  {(mockInterviewData.technicalPerformance != null || mockInterviewData.codingPerformance != null) && (
                    <div className="analytics-interview-breakdown">
                      {mockInterviewData.technicalPerformance != null && (
                        <div><span>Technical</span><strong>{mockInterviewData.technicalPerformance}%</strong></div>
                      )}
                      {mockInterviewData.codingPerformance != null && (
                        <div><span>Coding</span><strong>{mockInterviewData.codingPerformance}%</strong></div>
                      )}
                    </div>
                  )}
                  {mockInterviewData.feedback && <p className="analytics-interview-feedback">{mockInterviewData.feedback}</p>}
                  {Array.isArray(mockInterviewData.perQuestion) && mockInterviewData.perQuestion.length > 0 && (
                    <details className="analytics-interview-details">
                      <summary>View question breakdown <ChevronRight size={15} aria-hidden="true" /></summary>
                      <div className="analytics-question-list">
                        {mockInterviewData.perQuestion.map((item) => (
                          <div className="analytics-question-row" key={item.id}>
                            <p>{item.question}</p>
                            <strong>{item.score}%</strong>
                            {item.missed?.length > 0 && <small>Review: {item.missed.join(', ')}</small>}
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </>
              ) : (
                <div className="analytics-interview-empty">
                  <p>{interviewUnlocked ? 'Your mock interview is ready when you are.' : 'Complete and pass all assessment stages to unlock the interview.'}</p>
                  <Link to={interviewUnlocked ? '/mock-interview' : '/assessment'}>
                    {interviewUnlocked ? 'Start mock interview' : 'Continue assessments'} <ArrowRight size={14} aria-hidden="true" />
                  </Link>
                </div>
              )}
            </article>
          </section>

        </>
      )}
    </div>
  );
}
