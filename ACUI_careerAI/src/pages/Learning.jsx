import React, { useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  ArrowRight, Atom, BarChart2, Bookmark, BookOpen, Braces, Check,
  ChevronRight, Clock3, Code2, Coffee, Cpu, Database, FileCode2, Flame,
  Layers, Palette, PenTool, Search, Server, ShieldCheck, Sparkles, Target,
  Terminal, Trophy, Users, Workflow
} from 'lucide-react';
import { useCareer } from '../context/CareerContext';
import { getRoadmap, getRoadmapItems, topicProgressStats } from '../data/roadmaps';
import { getAssessmentTopicMatch, getLearningLevel } from '../data/learning';
import {
  getLearningActivityStats, getLearningTopicProgress, getLearningTopicRecord, getRecommendedTopic,
  getResumeTopic
} from '../utils/learning';

const levels = ['All levels', 'Beginner', 'Intermediate', 'Advanced'];
const statusTabs = [
  { id: 'all', label: 'AI Topics' },
  { id: 'inProgress', label: 'In Progress' },
  { id: 'completed', label: 'Completed' },
  { id: 'bookmarks', label: 'Bookmarks' }
];

function topicIconFor(topicName) {
  const name = topicName.toLowerCase();
  if (/java(?!script)|coffee/.test(name)) return Coffee;
  if (/javascript|script|html|css|web/.test(name)) return Code2;
  if (/react|ui|visual|tableau|power bi|figma|design|color/.test(name)) return Palette;
  if (/python|machine learning|deep learning|statistic|science/.test(name)) return BrainIcon;
  if (/sql|database|etl/.test(name)) return Database;
  if (/api|rest|service/.test(name)) return Workflow;
  if (/security|test|quality|bug|accessibility/.test(name)) return ShieldCheck;
  if (/data|excel|report|business intelligence/.test(name)) return BarChart2;
  if (/requirement|stakeholder|management|agile|scrum/.test(name)) return Users;
  if (/object|oop|class|principle/.test(name)) return Braces;
  if (/spring|backend|server|node/.test(name)) return Server;
  if (/terminal|command/.test(name)) return Terminal;
  if (/hardware|processor|computer/.test(name)) return Cpu;
  if (/prototype|wireframe|drawing/.test(name)) return PenTool;
  if (/model|diagram|process/.test(name)) return Layers;
  if (/atom|molecule/.test(name)) return Atom;
  if (/file|document/.test(name)) return FileCode2;
  return BookOpen;
}

function BrainIcon(props) {
  return <Sparkles {...props} />;
}

function TopicCard({ topic, progress, roadmap, onToggleBookmark, index }) {
  const Icon = topicIconFor(topic.name);
  const roadmapItemCount = getRoadmapItems(roadmap).length;
  const action = progress.status === 'Not started' ? 'Start learning' : 'Continue learning';

  return (
    <article className={`learn-topic-card learn-topic-card--${index % 4}`}>
      <div className="learn-topic-card-inner">
        <div className="learn-topic-card-topline">
          <span className="learn-topic-icon" aria-hidden="true"><Icon size={27} strokeWidth={2.2} /></span>
          <button
            type="button"
            className={`learn-bookmark-button${progress.isBookmarked ? ' is-saved' : ''}`}
            onClick={onToggleBookmark}
            aria-label={`${progress.isBookmarked ? 'Remove' : 'Add'} ${topic.name} ${progress.isBookmarked ? 'from' : 'to'} bookmarks`}
            aria-pressed={progress.isBookmarked}
            title={progress.isBookmarked ? 'Remove bookmark' : 'Bookmark topic'}
          >
            <Bookmark size={18} fill={progress.isBookmarked ? 'currentColor' : 'none'} />
          </button>
        </div>
        <div className="learn-topic-title-row">
          <h3>{topic.name}</h3>
          <span className="learn-level-tag">{getLearningLevel(topic.name)}</span>
        </div>
        <p className="learn-topic-description">{topic.description}</p>
        <div className="learn-topic-meta">
          <span>{roadmapItemCount} roadmap items</span>
          <span className={`learn-topic-status${progress.status === 'Mastered' ? ' is-complete' : ''}`}>
            {progress.status === 'Mastered' && <Check size={13} aria-hidden="true" />}
            {progress.status}
          </span>
        </div>
        <div
          className="learn-progress-track"
          role="progressbar"
          aria-label={`${topic.name} progress`}
          aria-valuenow={progress.percent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <span style={{ width: `${progress.percent}%` }} />
        </div>
        <div className="learn-topic-progress-caption">
          <span>{progress.completedCount} of 3 phases</span>
          <strong>{progress.percent}%</strong>
        </div>
        <Link to={`/roadmap/${topic.id}`} className="learn-topic-action">
          {action}<ArrowRight size={17} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}

export default function Learning() {
  const {
    selectedCareer, progressReady, learningProgress, roadmapProgress, learningJourney = {},
    skillScores, assessmentData, toggleLearningBookmark
  } = useCareer();
  const [search, setSearch] = useState('');
  const [level, setLevel] = useState('All levels');
  const [activeTab, setActiveTab] = useState('all');
  const topics = selectedCareer?.topics || [];

  const topicRows = useMemo(() => topics.map((topic) => {
    const legacy = topicProgressStats(topic.name, roadmapProgress[topic.id] || {});
    return {
      topic,
      legacy,
      progress: getLearningTopicProgress(
        topic.id,
        learningJourney,
        legacy.percent,
        legacy.complete || !!learningProgress[topic.id],
        selectedCareer?.id
      ),
      roadmap: getRoadmap(topic.name)
    };
  }), [topics, roadmapProgress, learningJourney, learningProgress, selectedCareer?.id]);

  if (!progressReady) {
    return <div className="learning-loading" role="status"><span className="learning-loading-mark" /><span>Opening your learning studio…</span></div>;
  }
  if (!selectedCareer) return <Navigate to="/careers" replace />;

  const counts = {
    all: topicRows.length,
    inProgress: topicRows.filter(({ progress }) => ['Learning', 'Practicing'].includes(progress.status)).length,
    completed: topicRows.filter(({ progress }) => progress.status === 'Mastered').length,
    bookmarks: topicRows.filter(({ progress }) => progress.isBookmarked).length
  };
  const completedCount = counts.completed;
  const overallProgress = topics.length
    ? Math.round(topicRows.reduce((sum, row) => sum + row.progress.percent, 0) / topics.length)
    : 0;
  const activity = getLearningActivityStats(learningJourney);
  const resumeTopic = getResumeTopic(
    topics,
    learningJourney,
    Object.fromEntries(topicRows.map(({ topic, legacy }) => [topic.id, legacy])),
    selectedCareer.id
  );
  const resumeTopicRecord = resumeTopic
    ? getLearningTopicRecord(learningJourney, selectedCareer.id, resumeTopic.id)
    : {};
  const weakestAssessedSkill = selectedCareer.weakestSkill || assessmentData?.weakestSkill || Object.entries(skillScores || {})
    .filter(([, data]) => data.total > 0)
    .sort((a, b) => (a[1].correct / a[1].total) - (b[1].correct / b[1].total))[0]?.[0];
  const recommendedTopic = getRecommendedTopic(
    topics,
    weakestAssessedSkill,
    learningJourney,
    Object.fromEntries(topicRows.map(({ topic, legacy }) => [topic.id, legacy])),
    selectedCareer.id
  );
  const recommendationMatchesWeakness = !!weakestAssessedSkill && !!recommendedTopic
    && getAssessmentTopicMatch(recommendedTopic.name, weakestAssessedSkill);
  const recentTopics = topicRows
    .filter(({ topic }) => getLearningTopicRecord(learningJourney, selectedCareer.id, topic.id).lastActivityAt)
    .sort((a, b) => new Date(getLearningTopicRecord(learningJourney, selectedCareer.id, b.topic.id).lastActivityAt) - new Date(getLearningTopicRecord(learningJourney, selectedCareer.id, a.topic.id).lastActivityAt))
    .slice(0, 3);
  const normalizedSearch = search.trim().toLowerCase();
  const visibleTopics = topicRows.filter(({ topic, progress }) => {
    const matchesStatus = activeTab === 'all'
      || (activeTab === 'inProgress' && ['Learning', 'Practicing'].includes(progress.status))
      || (activeTab === 'completed' && progress.status === 'Mastered')
      || (activeTab === 'bookmarks' && progress.isBookmarked);
    const matchesSearch = `${topic.name} ${topic.description}`.toLowerCase().includes(normalizedSearch);
    const matchesLevel = level === 'All levels' || getLearningLevel(topic.name) === level;
    return matchesStatus && matchesSearch && matchesLevel;
  });
  const resumePath = resumeTopic ? `/roadmap/${resumeTopic.id}` : '/learning';
  const savedTopics = topicRows.filter(({ progress }) => progress.isBookmarked);

  return (
    <div className="learning-page">
      <header className="learning-hero">
        <div className="learning-hero-copy">
          <p className="learning-eyebrow"><Sparkles size={15} aria-hidden="true" /> Your learning studio</p>
          <h1>Start Your<br /><span>Learning Journey</span></h1>
          <p className="learning-hero-description">Access curated courses, videos, reading materials, practice tasks and mini projects.</p>
          <div className="learning-career-tag"><span aria-hidden="true">{selectedCareer.icon}</span>{selectedCareer.title}</div>
        </div>
        <img
          className="learning-student-scene"
          src="/images/scenes/learning-student.png"
          alt="A cheerful student learning at a laptop with books nearby"
        />
      </header>

      <section className="learning-catalog" aria-labelledby="skills-heading">
        <div className="learning-catalog-heading">
          <div>
            <p className="learning-section-kicker">Your career path</p>
            <h2 id="skills-heading">Explore your skills</h2>
          </div>
          <span className="learning-catalog-count">{topics.length} {topics.length === 1 ? 'topic' : 'topics'} · {completedCount} completed</span>
        </div>

        <div className="learning-toolbar">
          <div className="learning-status-tabs" role="group" aria-label="Filter topics by status">
            {statusTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`learning-status-tab${activeTab === tab.id ? ' is-active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
                aria-pressed={activeTab === tab.id}
              >
                {tab.label}<span>{counts[tab.id]}</span>
              </button>
            ))}
          </div>
          <div className="learning-filters">
            <label className="learning-search">
              <Search size={17} aria-hidden="true" />
              <span className="sr-only">Search topics</span>
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search topics" />
            </label>
            <label className="sr-only" htmlFor="learning-level">Filter by skill level</label>
            <select id="learning-level" value={level} onChange={(event) => setLevel(event.target.value)} className="learning-level-select">
              {levels.map((filter) => <option key={filter}>{filter}</option>)}
            </select>
          </div>
        </div>

        {visibleTopics.length ? (
          <div className="learning-topic-grid">
            {visibleTopics.map(({ topic, progress, roadmap }, index) => (
              <TopicCard
                key={topic.id}
                topic={topic}
                progress={progress}
                roadmap={roadmap}
                index={index}
                onToggleBookmark={() => toggleLearningBookmark(selectedCareer.id, topic.id)}
              />
            ))}
          </div>
        ) : (
          <div className="learning-empty-state" role="status">
            <div className="learning-empty-icon"><Search size={22} aria-hidden="true" /></div>
            <h3>{topicRows.length ? 'No topics match these filters' : 'Your learning path is taking shape'}</h3>
            <p>{topicRows.length
              ? 'Try another status, search term or difficulty level.'
              : 'Choose a career with learning topics to see your personalized paths here.'}</p>
            {(activeTab !== 'all' || search || level !== 'All levels') && (
              <button type="button" className="learning-clear-filters" onClick={() => {
                setActiveTab('all');
                setSearch('');
                setLevel('All levels');
              }}>
                Show all topics
              </button>
            )}
          </div>
        )}
      </section>

      <section className="learning-support-grid" aria-label="Learning progress and activity">
        <article className="learning-overview-panel">
          <div className="learning-panel-heading">
            <span className="learning-panel-icon"><Target size={19} aria-hidden="true" /></span>
            <div><p className="learning-section-kicker">Your progress</p><h2>Keep your momentum</h2></div>
          </div>
          <div className="learning-overview-score"><strong>{overallProgress}%</strong><span>overall path progress</span></div>
          <div className="learning-overall-track" role="progressbar" aria-label="Overall learning progress" aria-valuenow={overallProgress} aria-valuemin={0} aria-valuemax={100}>
            <span style={{ width: `${overallProgress}%` }} />
          </div>
          <p className="learning-overview-caption">{completedCount} of {topics.length} topics mastered</p>
          <div className="learning-activity-stats">
            <div><Flame size={17} aria-hidden="true" /><strong>{activity.streak}</strong><span>day streak</span></div>
            <div><Trophy size={17} aria-hidden="true" /><strong>{activity.xp}</strong><span>earned XP</span></div>
          </div>
        </article>

        <article className="learning-resume-panel">
          <div className="learning-panel-heading">
            <span className="learning-panel-icon"><BookOpen size={19} aria-hidden="true" /></span>
            <div><p className="learning-section-kicker">{resumeTopicRecord.lastVisitedAt ? 'Pick up where you left off' : 'Your next topic'}</p><h2>{resumeTopic?.name || 'Ready when you are'}</h2></div>
          </div>
          <p>{resumeTopic?.description || 'Choose a topic from your career path to get started.'}</p>
          {resumeTopic && <Link to={resumePath} className="learning-support-link">Continue learning <ArrowRight size={16} aria-hidden="true" /></Link>}
        </article>

        {recommendedTopic && recommendedTopic.name !== resumeTopic?.name && (
          <article className="learning-recommendation-panel">
            <span className="learning-panel-icon"><Sparkles size={19} aria-hidden="true" /></span>
            <p className="learning-section-kicker">Recommended for you</p>
            <h2>{recommendedTopic.name}</h2>
            <p>{recommendationMatchesWeakness
              ? `A useful focus based on your ${weakestAssessedSkill} assessment results.`
              : 'A good next step in your career learning path.'}</p>
            <Link to={`/roadmap/${recommendedTopic.id}`} className="learning-support-link">View topic <ArrowRight size={16} aria-hidden="true" /></Link>
          </article>
        )}

        <article className="learning-saved-panel">
          <div className="learning-panel-heading">
            <span className="learning-panel-icon"><Bookmark size={18} aria-hidden="true" /></span>
            <div><p className="learning-section-kicker">Quick revision</p><h2>Saved topics</h2></div>
          </div>
          {savedTopics.length ? (
            <ul className="learning-support-list">
              {savedTopics.slice(0, 3).map(({ topic }) => (
                <li key={topic.id}><Link to={`/roadmap/${topic.id}`}>{topic.name}<ChevronRight size={16} aria-hidden="true" /></Link></li>
              ))}
            </ul>
          ) : <p className="learning-support-empty">Bookmark a topic to keep it close for later.</p>}
        </article>

        <article className="learning-recent-panel">
          <div className="learning-panel-heading">
            <span className="learning-panel-icon"><Clock3 size={19} aria-hidden="true" /></span>
            <div><p className="learning-section-kicker">Your activity</p><h2>Recently learned</h2></div>
          </div>
          {recentTopics.length ? (
            <ul className="learning-support-list">
              {recentTopics.map(({ topic, progress }) => (
                <li key={topic.id}>
                  <Link to={`/roadmap/${topic.id}`}>
                    <span>{topic.name}<small>{progress.status} · {progress.percent}% complete</small></span>
                    <ChevronRight size={16} aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          ) : <p className="learning-support-empty">Your recent learning activity will appear here.</p>}
        </article>
      </section>
    </div>
  );
}
