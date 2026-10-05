import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Award, BookOpen, Bot, Briefcase, CheckCircle2,
  Edit2, Mail, Save, Target, UserRound, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCareer } from '../context/CareerContext';
import { topicProgressStats } from '../data/roadmaps';
import { getLearningActivityStats, getLearningTopicProgress, getLearningTopicRecord } from '../utils/learning';
import { apiRequest } from '../utils/api';

export default function Profile() {
  const { currentUser, updateUser } = useAuth();
  const {
    selectedCareer, overallScore, readinessLevel, certificateData, assessmentData,
    mockInterviewData, skillScores, learningProgress, roadmapProgress,
    learningJourney = {}
  } = useCareer();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentUser?.name || '');
  const [saveError, setSaveError] = useState('');
  const [courseResults, setCourseResults] = useState([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [courseLoadError, setCourseLoadError] = useState('');
  const activity = getLearningActivityStats(learningJourney);
  const topics = selectedCareer?.topics || [];
  const progressRows = topics.map((topic) => {
    const legacy = topicProgressStats(topic.name, roadmapProgress[topic.id] || {});
    return { topic, progress: getLearningTopicProgress(topic.id, learningJourney, legacy.percent, legacy.complete || !!learningProgress[topic.id], selectedCareer?.id) };
  });
  const mastered = progressRows.filter((row) => row.progress.status === 'Mastered').length;
  const projects = progressRows.map(({ topic }) => ({ topic, record: getLearningTopicRecord(learningJourney, selectedCareer?.id, topic.id) }))
    .filter(({ record }) => record.phases?.build?.completedAt && record.phases.build.completedAt !== 'legacy')
    .map(({ topic, record }) => ({ topic, evidence: record.phases.build.evidence, hasEvidence: !!record.phases.build.evidence }));
  const skills = Object.entries(skillScores || {}).filter(([, data]) => data.total > 0)
    .map(([skill, data]) => ({ skill, score: Math.round((data.correct / data.total) * 100) }))
    .sort((a, b) => b.score - a.score);
  const passedStages = [1, 2, 3].filter((stage) => assessmentData[stage]?.passed).length;

  useEffect(() => setName(currentUser?.name || ''), [currentUser?.name]);

  useEffect(() => {
    let active = true;
    setIsLoadingCourses(true);
    setCourseLoadError('');
    apiRequest('/api/profile')
      .then(({ courseResults: results }) => {
        if (active) setCourseResults(results);
      })
      .catch((error) => {
        if (active) setCourseLoadError(error.message);
      })
      .finally(() => {
        if (active) setIsLoadingCourses(false);
      });
    return () => {
      active = false;
    };
  }, [currentUser?.id]);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaveError('');
    try {
      await updateUser(name.trim());
      setIsEditing(false);
    } catch (error) {
      setSaveError(error.message);
    }
  };

  const handleCancel = () => {
    setName(currentUser?.name || '');
    setIsEditing(false);
  };

  return (
    <div className="career-profile-page mx-auto max-w-5xl space-y-6 pb-10">
      <div className="profile-hero">
        <div className="profile-intro">
          <header className="career-profile-heading">
            <p className="profile-eyebrow">Your career identity</p>
            <h1>Your <span>Profile</span></h1>
            <p className="profile-intro-copy">A snapshot of your goals, learning, and verified progress.</p>
          </header>
          <img className="profile-illustration" src="/images/scenes/career-path-girl.png" alt="" aria-hidden="true" />
          <span className="profile-spark profile-spark-one" aria-hidden="true" />
          <span className="profile-spark profile-spark-two" aria-hidden="true" />
        </div>

        <section className="profile-identity-panel" aria-label="Account identity">
          <div className="profile-identity-mark"><UserRound size={27} /></div>
          <div className="profile-identity-copy">
            {isEditing
              ? <label className="profile-name-label"><span>Full name</span><input value={name} maxLength={80} onChange={(event) => setName(event.target.value)} className="profile-name-input" autoComplete="name" /></label>
              : <h2>{currentUser?.name || 'Learner'}</h2>}
            <p className="profile-email"><Mail size={15} />{currentUser?.email}</p>
            <p className="profile-role">{selectedCareer ? selectedCareer.title : 'No career selected'}</p>
          </div>
          {isEditing
            ? <div className="profile-edit-actions"><button type="button" onClick={handleCancel} className="profile-secondary-action"><X size={15} /> Cancel</button><button type="button" onClick={handleSave} disabled={!name.trim()} className="learning-primary-button"><Save size={15} /> Save</button></div>
            : <button type="button" onClick={() => setIsEditing(true)} className="profile-secondary-action"><Edit2 size={15} /> Edit name</button>}
        </section>
      </div>

      {saveError && <p role="alert" className="auth-error text-sm">{saveError}</p>}

      <section className="profile-summary-grid">
        <article className="profile-summary-card"><span><Target size={16} /> Career goal</span><strong>{selectedCareer ? `${selectedCareer.icon} ${selectedCareer.title}` : 'Not selected'}</strong><Link to="/careers">{selectedCareer ? 'Change path' : 'Choose a path'} <ArrowRight size={13} /></Link></article>
        <article className="profile-summary-card"><span><Award size={16} /> Readiness</span><strong>{passedStages ? readinessLevel : 'Not assessed'}</strong><small>{passedStages ? `${overallScore}% across passed stages` : 'Assessment results will appear here'}</small></article>
        <article className="profile-summary-card"><span><BookOpen size={16} /> Learning</span><strong>{mastered}/{topics.length} skills mastered</strong><small>{activity.xp} earned XP · {activity.streak} day streak</small></article>
        <article className="profile-summary-card"><span><Bot size={16} /> Mock interview</span><strong>{mockInterviewData ? `${mockInterviewData.score}%` : 'Not taken'}</strong><small>{mockInterviewData ? (mockInterviewData.passed ? 'Passed' : 'Practice again') : 'No interview score saved'}</small></article>
      </section>

      <section className="profile-detail-panel">
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Verified learning</p>
          <h2 className="mt-1 text-lg font-semibold text-white">Completed courses</h2>
        </div>
        {isLoadingCourses
          ? <p className="text-sm text-gray-400" role="status">Loading completed courses…</p>
          : courseLoadError
            ? <p className="text-sm text-rose-300" role="alert">{courseLoadError}</p>
            : courseResults.length
              ? <div className="space-y-3">{courseResults.map((course) => {
                const completedDate = new Date(course.completedAt);
                const dateLabel = Number.isNaN(completedDate.getTime())
                  ? course.completedAt
                  : completedDate.toLocaleDateString();
                return (
                  <article className="profile-project-row" key={course.courseId}>
                    <span className="profile-project-icon"><CheckCircle2 size={16} /></span>
                    <div className="min-w-0 flex-1">
                      <strong>{course.courseName}</strong>
                      <p>{course.marks}% · {course.status} · Completed {dateLabel}</p>
                    </div>
                  </article>
                );
              })}</div>
              : <p className="text-sm leading-6 text-gray-500">No completed courses yet.</p>}
      </section>

      <div className="profile-detail-grid">
        <section className="profile-detail-panel"><div className="mb-4 flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Demonstrated skills</p><h2 className="mt-1 text-lg font-semibold text-white">Assessment results</h2></div><Link to="/skill-analysis" className="profile-inline-link">View analytics <ArrowRight size={13} /></Link></div>
          {skills.length ? <div className="space-y-3">{skills.slice(0, 6).map((skill) => <div className="profile-skill-row" key={skill.skill}><span>{skill.skill}</span><span><i style={{ width: `${skill.score}%` }} /> <strong>{skill.score}%</strong></span></div>)}</div> : <p className="text-sm leading-6 text-gray-500">No assessment-based skill results yet.</p>}
        </section>

        <section className="profile-detail-panel"><div className="mb-4"><p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Applied practice</p><h2 className="mt-1 text-lg font-semibold text-white">Completed projects</h2></div>
          {projects.length ? <div className="space-y-3">{projects.map(({ topic, evidence, hasEvidence }) => <article className="profile-project-row" key={topic.id}><span className="profile-project-icon"><Briefcase size={16} /></span><div className="min-w-0"><strong>{topic.name} · {hasEvidence ? 'Build reflection saved' : 'Build completed'}</strong><p>{evidence || topic.description}</p></div></article>)}</div> : <p className="text-sm leading-6 text-gray-500">Completed Learning projects will appear here after you finish a Build phase.</p>}
        </section>
      </div>

      <section className="profile-certificate-panel"><div className="profile-certificate-icon"><Award size={20} /></div><div className="min-w-0 flex-1"><p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Digital Skill Passport</p><h2 className="mt-1 text-lg font-semibold text-white">{certificateData ? certificateData.career : 'Not issued'}</h2><p className="mt-1 text-sm text-gray-400">{certificateData ? `Issued ${certificateData.date} · ID ${certificateData.id}` : 'Issued only after the required assessment stages and interview are passed.'}</p></div>{certificateData && <Link to="/certificate" className="learning-primary-button">View passport <ArrowRight size={15} /></Link>}</section>

      <section className="profile-milestones"><div><p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Verified milestones</p><h2 className="mt-1 text-lg font-semibold text-white">Progress earned</h2></div><div className="mt-4 flex flex-wrap gap-2">{passedStages > 0 && <span><CheckCircle2 size={14} /> {passedStages} assessment stage{passedStages === 1 ? '' : 's'} passed</span>}{mockInterviewData?.passed && <span><CheckCircle2 size={14} /> Mock interview passed</span>}{mastered > 0 && <span><CheckCircle2 size={14} /> {mastered} skill{mastered === 1 ? '' : 's'} mastered</span>}{certificateData && <span><Award size={14} /> Passport issued</span>}{!passedStages && !mockInterviewData?.passed && !mastered && !certificateData && <p className="text-sm text-gray-500">Milestones appear here as you complete real activities.</p>}</div></section>
    </div>
  );
}
