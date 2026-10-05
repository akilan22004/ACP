import React, { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, Bookmark, BookOpen, Check, CheckCircle2, ChevronRight,
  PlayCircle, ExternalLink, Lightbulb, LockKeyhole, RotateCcw, Sparkles,
  Target, Youtube, FileText, MessageCircle, PanelTop, ListChecks
} from 'lucide-react';
import { useCareer } from '../context/CareerContext';
import { getRoadmap, topicProgressStats } from '../data/roadmaps';
import {
  findLearningExercise, getLearningLevel, getStudyResources, getVideoId,
  getVideoThumbnail
} from '../data/learning';
import { learningPhases, getLearningTopicProgress, getLearningTopicRecord, resolveLearningTopic } from '../utils/learning';

const phaseIcons = { learn: Lightbulb, try: Target, build: CheckCircle2 };
const minimumReflectionLength = 16;

function VideoResource({ video, topicName, difficulty }) {
  const [imageUnavailable, setImageUnavailable] = useState(false);
  const videoId = getVideoId(video.url);
  const thumbnail = getVideoThumbnail(video.url);
  const titleSource = video.title.match(/\(([^)]+)\)$/)?.[1];
  const source = titleSource && !titleSource.toLowerCase().includes('beginner course') ? titleSource : 'YouTube';

  useEffect(() => setImageUnavailable(false), [videoId]);

  return (
    <a href={video.url} target="_blank" rel="noopener noreferrer" className="learn-video-card">
      <div className="learn-video-thumb">
        {thumbnail && !imageUnavailable && <img src={thumbnail} alt="" loading="lazy" onError={() => setImageUnavailable(true)} />}
        {(!videoId || !thumbnail || imageUnavailable) && <div className="learn-video-thumb-fallback"><Youtube size={24} /><span>{topicName}</span></div>}
        <span className="learn-video-play"><PlayCircle size={27} /></span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-sm font-semibold leading-5 text-white">{video.title}</p>
        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500"><span>{source}</span><span aria-hidden="true">·</span><span>{video.duration || 'Duration shown on YouTube'}</span></div>
        <div className="mt-2 flex flex-wrap gap-1.5"><span className="learning-resource-chip">{topicName}</span><span className="learning-resource-chip">{difficulty}</span></div>
      </div>
      <ExternalLink size={15} className="shrink-0 text-gray-500" />
    </a>
  );
}

function StudyResource({ resource, topicName }) {
  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      className="learning-study-resource"
      aria-label={`Read ${resource.title} for ${topicName} at ${resource.source} (opens in a new tab)`}
    >
      <span className="learning-resource-icon"><BookOpen size={18} /></span>
      <span className="learning-resource-copy">
        <span className="learning-resource-type">{resource.type}</span>
        <strong>{resource.title}</strong>
        <small>{resource.source}</small>
        <span className="learning-resource-meta">{resource.difficulty} · {resource.minutes} min</span>
        <span className="learning-resource-cta">Read resource <ExternalLink size={13} /></span>
      </span>
    </a>
  );
}

function FeaturedVideo({ video, topicName }) {
  const [imageUnavailable, setImageUnavailable] = useState(false);
  const thumbnail = getVideoThumbnail(video.url);

  useEffect(() => setImageUnavailable(false), [video.url]);

  return (
    <a
      href={video.url}
      target="_blank"
      rel="noopener noreferrer"
      className="learning-featured-video"
      aria-label={`Open ${video.title} on YouTube in a new tab`}
    >
      <div className="learning-featured-video-art">
        {thumbnail && !imageUnavailable
          ? <img src={thumbnail} alt="" onError={() => setImageUnavailable(true)} />
          : <div className="learning-featured-video-fallback"><Youtube size={34} /><span>{topicName}</span></div>}
        <span className="learning-featured-video-play"><PlayCircle size={48} /></span>
      </div>
      <div className="learning-featured-video-caption">
        <span><PlayCircle size={14} /> Curated video · opens on YouTube</span>
        <strong>{video.title}</strong>
        <small>External video resource · opens in a new tab</small>
      </div>
    </a>
  );
}

export default function Roadmap() {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const {
    selectedCareer, progressReady, roadmapProgress, learningProgress, learningJourney = {},
    recordLearningVisit, toggleLearningBookmark, saveLearningDraft, completeLearningPhase
  } = useCareer();
  const topic = resolveLearningTopic(selectedCareer, topicId);
  const roadmap = useMemo(() => topic ? getRoadmap(topic.name) : null, [topic?.name]);
  const studyResources = useMemo(() => topic && roadmap ? getStudyResources(topic.name, roadmap.reading) : [], [topic?.name, roadmap]);
  const exercise = useMemo(() => topic ? findLearningExercise(topic, selectedCareer?.id) : null, [topic, selectedCareer?.id]);
  const savedTopic = getLearningTopicRecord(learningJourney, selectedCareer?.id, topicId);
  const legacy = topic ? topicProgressStats(topic.name, roadmapProgress[topicId] || {}) : { percent: 0, complete: false };
  const progress = getLearningTopicProgress(topicId, learningJourney, legacy.percent, legacy.complete || !!learningProgress[topicId], selectedCareer?.id);
  const [activePhaseSelection, setActivePhaseSelection] = useState(null);
  const [loadedDraftTopic, setLoadedDraftTopic] = useState('');
  const [tryDraft, setTryDraft] = useState('');
  const [buildDraft, setBuildDraft] = useState('');
  const [answerIndex, setAnswerIndex] = useState(null);
  const [answerResult, setAnswerResult] = useState(null);
  const [projectConfirmed, setProjectConfirmed] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!topic || !topicId) return;
    recordLearningVisit(selectedCareer.id, topicId);
  }, [topic, topicId, selectedCareer?.id, recordLearningVisit]);

  useEffect(() => {
    if (!topic || !topicId) return;
    setTryDraft(savedTopic.drafts?.try || '');
    setBuildDraft(savedTopic.drafts?.build || '');
    setLoadedDraftTopic(topicId);
    setAnswerIndex(null);
    setAnswerResult(null);
    setProjectConfirmed(false);
    setActivePhaseSelection(null);
    setMessage('');
    setActiveTab('overview');
  }, [topicId, selectedCareer?.id]);

  useEffect(() => {
    if (!topic || loadedDraftTopic !== topicId) return;
    saveLearningDraft(selectedCareer.id, topicId, 'try', tryDraft);
  }, [topic, topicId, selectedCareer?.id, loadedDraftTopic, tryDraft, saveLearningDraft]);

  useEffect(() => {
    if (!topic || loadedDraftTopic !== topicId) return;
    saveLearningDraft(selectedCareer.id, topicId, 'build', buildDraft);
  }, [topic, topicId, selectedCareer?.id, loadedDraftTopic, buildDraft, saveLearningDraft]);

  useEffect(() => {
    if (!message) return undefined;
    const timeout = window.setTimeout(() => setMessage(''), 3200);
    return () => window.clearTimeout(timeout);
  }, [message]);

  if (!progressReady) return <div className="learning-loading" role="status"><span className="learning-loading-mark" /><span>Restoring your lesson…</span></div>;
  if (!selectedCareer) return <Navigate to="/careers" replace />;
  if (!topic || !roadmap) return <Navigate to="/learning" replace />;

  const topicIndex = selectedCareer.topics.findIndex((item) => item.id === topic.id);
  const previousTopic = topicIndex > 0 ? selectedCareer.topics[topicIndex - 1] : null;
  const nextTopic = topicIndex >= 0 && topicIndex < selectedCareer.topics.length - 1
    ? selectedCareer.topics[topicIndex + 1]
    : null;
  const firstIncompleteIndex = learningPhases.findIndex((phase) => !progress.phases[phase.id]?.completedAt);
  const firstIncompletePhase = learningPhases[firstIncompleteIndex < 0 ? 0 : firstIncompleteIndex].id;
  const isLegacyMastered = legacy.complete || !!learningProgress[topicId];
  const maxUnlocked = isLegacyMastered || firstIncompleteIndex < 0
    ? learningPhases.length - 1
    : firstIncompleteIndex;
  const selectionMatchesTopic = activePhaseSelection?.topicId === topicId
    && activePhaseSelection?.careerId === selectedCareer.id;
  const requestedPhase = selectionMatchesTopic
    ? learningPhases.find((phase) => phase.id === activePhaseSelection.phaseId)
    : null;
  const requestedPhaseIndex = requestedPhase
    ? learningPhases.findIndex((phase) => phase.id === requestedPhase.id)
    : -1;
  const activePhase = requestedPhase && requestedPhaseIndex <= maxUnlocked
    ? requestedPhase
    : learningPhases.find((phase) => phase.id === firstIncompletePhase);
  const activeIndex = learningPhases.findIndex((phase) => phase.id === activePhase.id);
  const videos = roadmap.youtube.filter((video) => getVideoId(video.url)).slice(0, 2);
  const featuredVideo = selectedCareer.id === 'java-full-stack' && topic.name === 'HTML/CSS'
    ? videos.find((video) => video.title.toLowerCase().includes('flexbox')) || videos[0]
    : videos[0];
  const reflectionReady = tryDraft.trim().length >= minimumReflectionLength;
  const buildReady = buildDraft.trim().length >= minimumReflectionLength && projectConfirmed;

  const completePhase = (phaseId, evidence) => {
    if (isLegacyMastered) {
      setMessage('This skill was completed on your previous roadmap. Continue exploring as a revision; no additional XP will be awarded.');
      return;
    }
    const phaseIndex = learningPhases.findIndex((phase) => phase.id === phaseId);
    if (phaseIndex < 0 || phaseIndex > maxUnlocked) {
      setMessage('Complete the previous phase before continuing.');
      return;
    }
    const priorCompletion = progress.phases[phaseId]?.completedAt;
    if (priorCompletion && priorCompletion !== 'legacy') {
      setMessage('You’ve already completed this phase. Your XP is saved and will not be awarded twice.');
      return;
    }
    const accepted = completeLearningPhase(selectedCareer.id, topicId, phaseId, evidence);
    if (!accepted) {
      setMessage('This phase could not be saved. Complete the previous phase first, then try again.');
      return;
    }
    const phase = learningPhases.find((item) => item.id === phaseId);
    setMessage(`${phase.label} complete · +${phase.xp} XP`);
    if (phaseId === 'learn') setActivePhaseSelection({ careerId: selectedCareer.id, topicId, phaseId: 'try' });
    if (phaseId === 'try') setActivePhaseSelection({ careerId: selectedCareer.id, topicId, phaseId: 'build' });
  };

  const submitPracticeAnswer = () => {
    if (answerIndex === null || !exercise) return;
    const correct = answerIndex === exercise.correctIndex;
    setAnswerResult(correct ? 'correct' : 'incorrect');
    if (!correct) return;
    setMessage('That’s right. Now apply the idea in the mini challenge.');
  };

  const submitTryPhase = () => {
    if (exercise && answerResult !== 'correct') {
      setMessage('Choose the correct answer before completing this practice.');
      return;
    }
    if (!reflectionReady) {
      setMessage(`Add a short attempt of at least ${minimumReflectionLength} characters to continue.`);
      return;
    }
    completePhase('try', [exercise ? `Correct answer: ${exercise.id}` : 'Practice reflection', tryDraft.trim()].filter(Boolean).join('\n\n'));
  };

  const submitBuildPhase = () => {
    if (!buildReady) {
      setMessage('Describe one thing you built and confirm you tested it to finish the project.');
      return;
    }
    completePhase('build', buildDraft.trim());
  };

  const choosePhase = (phase, index) => {
    if (index > maxUnlocked) return;
    setActivePhaseSelection({ careerId: selectedCareer.id, topicId, phaseId: phase.id });
    setMessage('');
  };

  return (
    <div className="learning-workspace learning-course-workspace mx-auto max-w-6xl pb-12">
      <header className="learning-workspace-header">
        <button type="button" onClick={() => navigate('/learning')} aria-label="Back to learning dashboard" className="learning-back-button"><ArrowLeft size={18} /></button>
        <div className="min-w-0 flex-1">
          <Link to="/learning" className="learning-back-link">Learning path <ChevronRight size={13} /> {selectedCareer.title}</Link>
          <p className="learning-course-eyebrow">{getLearningLevel(topic.name)} · Topic workspace</p>
          <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">{topic.name}</h1>
          <p className="learning-course-description">{topic.description}</p>
        </div>
        <button type="button" aria-pressed={progress.isBookmarked} onClick={() => toggleLearningBookmark(selectedCareer.id, topicId)} className={`learning-bookmark-button ${progress.isBookmarked ? 'is-saved' : ''}`} title={progress.isBookmarked ? 'Remove bookmark' : 'Bookmark skill'}>
          <Bookmark size={17} fill={progress.isBookmarked ? 'currentColor' : 'none'} /><span className="hidden sm:inline">{progress.isBookmarked ? 'Saved' : 'Save skill'}</span>
        </button>
      </header>

      <section className="learning-journey-bar" aria-label="Learn Try Build progress">
        {learningPhases.map((phase, index) => {
          const Icon = phaseIcons[phase.id];
          const complete = !!progress.phases[phase.id]?.completedAt;
          const locked = index > maxUnlocked;
          const current = activePhase.id === phase.id;
          return <React.Fragment key={phase.id}>
            <button type="button" onClick={() => choosePhase(phase, index)} disabled={locked} aria-current={current ? 'step' : undefined} className={`learning-journey-step ${current ? 'is-current' : ''} ${complete ? 'is-done' : ''} ${locked ? 'is-locked' : ''}`}>
              <span className="learning-step-icon">{complete ? <Check size={17} /> : locked ? <LockKeyhole size={15} /> : <Icon size={17} />}</span>
              <span><strong>{phase.label}</strong><small>{complete ? 'Completed' : locked ? 'Complete previous phase' : `${phase.xp} XP`}</small></span>
            </button>
            {index < learningPhases.length - 1 && <span className={`learning-journey-connector ${complete ? 'is-done' : ''}`} aria-hidden="true" />}
          </React.Fragment>;
        })}
      </section>

      <div className="learning-workspace-progress"><span>Topic progress</span><div className="learning-progress-track"><span style={{ width: `${progress.percent}%` }} /></div><strong>{progress.percent}%</strong><span className="learning-phase-count">{progress.completedCount} of 3 phases complete</span></div>

      <div className="learning-course-grid">
        <aside className="learning-topic-sidebar" aria-label={`${selectedCareer.title} topics`}>
          <div className="learning-side-heading"><span>YOUR ROADMAP</span><strong>{selectedCareer.topics.length} topics</strong></div>
          <nav className="learning-topic-list">
            {selectedCareer.topics.map((item, index) => {
              const itemLegacy = topicProgressStats(item.name, roadmapProgress[item.id] || {});
              const itemProgress = getLearningTopicProgress(item.id, learningJourney, itemLegacy.percent, itemLegacy.complete || !!learningProgress[item.id], selectedCareer.id);
              const isCurrent = item.id === topicId;
              return (
                <Link key={`${selectedCareer.id}-${item.id}`} to={`/roadmap/${item.id}`} aria-current={isCurrent ? 'page' : undefined} className={`learning-topic-link ${isCurrent ? 'is-current' : ''}`}>
                  <span className="learning-topic-number">{String(index + 1).padStart(2, '0')}</span>
                  <span className="learning-topic-copy"><strong>{item.name}</strong><small>{itemProgress.completedCount === 3 ? 'Completed' : `${itemProgress.percent}% complete`}</small></span>
                  {isCurrent && <span className="learning-topic-active-mark" aria-hidden="true" />}
                </Link>
              );
            })}
          </nav>
          <Link to="/learning" className="learning-sidebar-back"><ArrowLeft size={14} /> Back to Learning</Link>
        </aside>

        <main className="learning-course-main">
          <section className="learning-course-intro">
            <div className="learning-intro-copy">
              <span className="learning-current-phase"><span /> PHASE {activeIndex + 1} OF 3 · {activePhase.label.toUpperCase()}</span>
              <h2>{topic.name}</h2>
              <p>{topic.description}</p>
            </div>
            {featuredVideo && <FeaturedVideo video={featuredVideo} topicName={topic.name} />}
            {!featuredVideo && <div className="learning-featured-video-empty"><BookOpen size={25} /><span>No direct video is curated for this topic yet.</span></div>}
          </section>

          <div className="learning-tab-bar" role="tablist" aria-label="Topic content">
            {[
              { id: 'overview', label: 'Overview', icon: PanelTop },
              { id: 'notes', label: 'Notes', icon: FileText },
              { id: 'resources', label: 'Resources', icon: BookOpen },
              { id: 'practice', label: 'Practice', icon: ListChecks }
            ].map(({ id, label, icon: Icon }) => (
              <button key={id} type="button" role="tab" id={`topic-tab-${id}`} aria-selected={activeTab === id} aria-controls="topic-panel" onClick={() => setActiveTab(id)} className={`learning-content-tab ${activeTab === id ? 'is-active' : ''}`}>
                <Icon size={15} />{label}
              </button>
            ))}
            <button type="button" role="tab" aria-selected="false" disabled title="Discussion is not available for this topic." className="learning-content-tab is-unavailable"><MessageCircle size={15} />Discussion <span>Unavailable</span></button>
          </div>
          <p className="learning-discussion-note"><MessageCircle size={13} /> Discussion is not available for this topic yet.</p>

          <section className="learning-course-panel" role="tabpanel" id="topic-panel" aria-labelledby={`topic-tab-${activeTab}`}>
            {activeTab === 'overview' && <div className="learning-panel-content">
              <div className="learning-panel-heading"><div><span className="learning-panel-kicker">AT A GLANCE</span><h3>What you’re working toward</h3></div><span className="learning-phase-status">{progress.completedCount} / 3 phases complete</span></div>
              <p className="learning-overview-copy">{roadmap.project.description}</p>
              <div className="learning-overview-facts">
                <div><span>Current step</span><strong>{activePhase.label}</strong></div>
                <div><span>Reading guides</span><strong>{studyResources.length}</strong></div>
                <div><span>Curated videos</span><strong>{videos.length}</strong></div>
              </div>
              <div className="learning-overview-footer"><span>{roadmap.tasks.length} suggested practice prompts are included in this topic path.</span><button type="button" onClick={() => setActiveTab('practice')} className="learning-primary-button">Continue to {activePhase.label.toLowerCase()} <ArrowRight size={15} /></button></div>
            </div>}

            {activeTab === 'notes' && <div className="learning-panel-content">
              <div className="learning-panel-heading"><div><span className="learning-panel-kicker">PRIVATE TO YOU</span><h3>{activePhase.id === 'build' ? 'Project log' : 'Practice notes'}</h3></div><FileText size={19} className="learning-panel-heading-icon" /></div>
              {activePhase.id === 'build'
                ? <><p className="learning-overview-copy">Describe your project decisions and how you checked the result. This edits the existing saved Build draft.</p><textarea id="learning-build-notes-tab" value={buildDraft} onChange={(event) => setBuildDraft(event.target.value)} maxLength={1600} rows={8} placeholder="I built… I checked it by…" className="learning-reflection-input learning-notes-input" /><span className="learning-notes-saved"><Check size={13} /> Saved automatically to your account</span></>
                : <><p className="learning-overview-copy">Capture an approach, result, or question while learning. This edits your existing Try draft and is saved automatically.</p><textarea id="learning-try-notes-tab" value={tryDraft} onChange={(event) => setTryDraft(event.target.value)} maxLength={1200} rows={8} placeholder="I tried…" className="learning-reflection-input learning-notes-input" /><span className="learning-notes-saved"><Check size={13} /> Saved automatically to your account</span></>}
            </div>}

            {activeTab === 'resources' && <div className="learning-panel-content">
              <div className="learning-panel-heading"><div><span className="learning-panel-kicker">CURATED FOR THIS TOPIC</span><h3>Learning resources</h3></div><span className="learning-phase-status">{studyResources.length + videos.length} resources</span></div>
              <section>
                <div className="learning-section-eyebrow"><BookOpen size={15} /> Reading</div>
                <p className="learning-resource-intro">Guides selected for {topic.name} in your {selectedCareer.title} path.</p>
                {studyResources.length
                  ? <div className="learning-resource-grid">{studyResources.map((resource) => <StudyResource key={resource.url} resource={resource} topicName={topic.name} />)}</div>
                  : <p className="learning-video-empty">No verified reading links are curated for this topic yet.</p>}
              </section>
              <section>
                <div className="learning-section-eyebrow"><PlayCircle size={15} /> Watch & learn</div>
                <p className="learning-resource-intro">Videos open at their original source; this page does not host playback.</p>
                {videos.length ? <div className="learning-video-list">{videos.map((video) => <VideoResource key={video.id} video={video} topicName={topic.name} difficulty={getLearningLevel(topic.name)} />)}</div> : <p className="learning-video-empty">No direct video is curated for this topic yet.</p>}
              </section>
            </div>}

            {activeTab === 'practice' && <div className="learning-phase-content">
              <header className="learning-phase-heading">
                <div><p className="learning-panel-kicker">PHASE {activeIndex + 1} OF 3</p><h3>{activePhase.label === 'Learn' ? 'Explore curated resources' : activePhase.label === 'Try' ? 'Put the idea into practice' : 'Make something useful'}</h3></div>
                <span className="learning-xp-pill"><Sparkles size={14} /> {activePhase.xp} XP</span>
              </header>

              {activePhase.id === 'learn' && <>
                <section className="learning-learn-summary"><div className="learning-challenge-icon"><Lightbulb size={19} /></div><div><h4>Start with the curated materials</h4><p>Use the Resources tab for the verified guides and videos in this topic. Mark Learn complete when you’re ready to unlock Try.</p></div><button type="button" onClick={() => setActiveTab('resources')} className="learning-secondary-button">View resources <ArrowRight size={14} /></button></section>
                <div className="learning-phase-action"><div><h4>Ready to give it a try?</h4><p>Completing Learn unlocks the existing practice activity.</p></div><button type="button" onClick={() => completePhase('learn', `Reviewed ${studyResources.length} reading resources and ${videos.length} videos for ${topic.name}`)} className="learning-primary-button">I’m ready to practice <ArrowRight size={16} /></button></div>
              </>}

              {activePhase.id === 'try' && <>
                <section className="learning-challenge-banner"><div className="learning-challenge-icon"><Target size={20} /></div><div><p className="text-xs font-semibold uppercase tracking-wider text-teal-200">Mini challenge</p><h4 className="mt-1 font-semibold text-white">{roadmap.tasks[0]?.text || `Apply one idea from ${topic.name}`}</h4><p className="mt-1 text-sm leading-5 text-gray-400">Work through the prompt below, then save a short note about your approach.</p></div></section>
                {exercise ? <section className="learning-exercise-card">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-2"><div><p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Knowledge check</p><h4 className="mt-1 text-lg font-semibold text-white">{exercise.prompt}</h4></div><span className="learning-source-tag">Assessment skill bank</span></div>
                  <div className="space-y-2">{exercise.options.map((option, index) => <button type="button" key={`${exercise.id}-${index}`} onClick={() => { if (answerResult !== 'correct') { setAnswerIndex(index); setAnswerResult(null); } }} className={`learning-answer-option ${answerIndex === index ? 'is-selected' : ''} ${answerResult === 'correct' && index === exercise.correctIndex ? 'is-correct' : answerResult === 'incorrect' && index === exercise.correctIndex ? 'is-reveal' : ''}`}><span>{String.fromCharCode(65 + index)}</span>{option}</button>)}</div>
                  <div className="mt-4 flex flex-wrap items-center gap-3"><button type="button" onClick={submitPracticeAnswer} disabled={answerIndex === null || answerResult === 'correct'} className="learning-secondary-button">Check answer</button>{answerResult === 'correct' && <p role="status" className="text-sm text-emerald-200">Correct. {exercise.explanation}</p>}{answerResult === 'incorrect' && <p role="status" className="text-sm text-amber-200">Not quite. The correct answer is highlighted. Try again when you’re ready.</p>}</div>
                </section> : <section className="learning-exercise-card"><div className="mb-2 flex items-center gap-2"><Target size={16} className="text-teal-200" /><h4 className="font-semibold text-white">Practice this skill</h4></div><p className="text-sm leading-6 text-gray-400">No assessment question is mapped to this topic yet. Make a small attempt at the challenge and save what you tried; this reflection is not automatically graded.</p></section>}
                <section className="learning-exercise-card"><label htmlFor="learning-try-note" className="block text-sm font-semibold text-white">Your attempt or working notes</label><p className="mt-1 text-xs text-gray-500">Saved automatically to your account. Include a result, query, sketch description, or one thing you learned.</p><textarea id="learning-try-note" value={tryDraft} onChange={(event) => setTryDraft(event.target.value)} maxLength={1200} rows={4} placeholder="I tried…" className="learning-reflection-input mt-3 w-full resize-y"/><div className="mt-3 flex flex-wrap items-center justify-between gap-3"><span className={`text-xs ${reflectionReady ? 'text-emerald-200' : 'text-gray-500'}`}>{tryDraft.trim().length}/{minimumReflectionLength} characters to save the attempt</span><button type="button" disabled={!reflectionReady || (exercise && answerResult !== 'correct')} onClick={submitTryPhase} className="learning-primary-button">Complete practice <ArrowRight size={16} /></button></div></section>
              </>}

              {activePhase.id === 'build' && <>
                <section className="learning-build-project"><p className="text-xs font-semibold uppercase tracking-wider text-amber-200">Build something</p><h4 className="mt-2 text-2xl font-semibold text-white">{roadmap.project.title}</h4><p className="mt-3 max-w-3xl text-sm leading-6 text-gray-300">{roadmap.project.description}</p><div className="mt-5"><p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Suggested first steps</p><ol className="mt-3 grid gap-2 sm:grid-cols-3">{roadmap.tasks.slice(0, 3).map((task, index) => <li key={task.id} className="learning-build-checkpoint"><span>{index + 1}</span>{task.text}</li>)}</ol></div></section>
                <section className="learning-exercise-card"><label htmlFor="learning-build-note" className="block text-sm font-semibold text-white">Project log</label><p className="mt-1 text-xs leading-5 text-gray-500">Describe what you built, one decision you made, and how you checked the result. Your note is saved privately with your progress.</p><textarea id="learning-build-note" value={buildDraft} onChange={(event) => setBuildDraft(event.target.value)} maxLength={1600} rows={5} placeholder="I built… I checked it by…" className="learning-reflection-input mt-3 w-full resize-y"/><label className="learning-confirm-row mt-4"><input type="checkbox" checked={projectConfirmed} onChange={(event) => setProjectConfirmed(event.target.checked)} /><span>I built a small version and checked that it works.</span></label><div className="mt-4 flex flex-wrap items-center justify-between gap-3"><span className={`text-xs ${buildReady ? 'text-emerald-200' : 'text-gray-500'}`}>{buildDraft.trim().length}/{minimumReflectionLength} characters and confirmation required</span><button type="button" disabled={!buildReady} onClick={submitBuildPhase} className="learning-primary-button"><CheckCircle2 size={16} /> Complete skill</button></div></section>
                {progress.status === 'Mastered' && <div className="learning-mastery-note"><CheckCircle2 size={19} /><span>You’ve mastered this skill path. Revisit any phase for a quick refresher.</span></div>}
              </>}
            </div>}
          </section>
        </main>

        <aside className="learning-outcomes-sidebar" aria-label="Topic learning outcomes">
          <div className="learning-outcomes-heading"><span>YOUR LEARNING</span><h2>What you’ll learn</h2><p>Key concepts in this topic path</p></div>
          <ul className="learning-outcome-list">
            {roadmap.concepts.map((concept) => <li key={concept.id}><span><Check size={13} /></span>{concept.text}</li>)}
          </ul>
          <div className="learning-outcomes-divider" />
          <div className="learning-phase-summary"><span>Phase progress</span><strong>{progress.completedCount} of 3</strong></div>
          <div className="learning-outcome-track"><span style={{ width: `${progress.percent}%` }} /></div>
          <p className="learning-outcome-progress">{progress.percent}% of this topic completed</p>
          <Link to="/learning" className="learning-outcome-link">All learning topics <ArrowRight size={14} /></Link>
        </aside>
      </div>

      <footer className="learning-workspace-footer">
        <Link to="/learning" className="learning-footer-link"><ArrowLeft size={15} /> All skills</Link>
        {previousTopic
          ? <Link to={`/roadmap/${encodeURIComponent(previousTopic.id)}`} className="learning-footer-link"><ArrowLeft size={15} /> Previous topic</Link>
          : <span className="learning-footer-link is-disabled" aria-disabled="true"><ArrowLeft size={15} /> Previous topic</span>}
        <span>{progress.completedCount} of 3 phases complete</span>
        {nextTopic
          ? <Link to={`/roadmap/${encodeURIComponent(nextTopic.id)}`} className="learning-footer-link">Next topic <ArrowRight size={15} /></Link>
          : <span className="learning-footer-link is-disabled" aria-disabled="true">Next topic <ArrowRight size={15} /></span>}
        {activeIndex < learningPhases.length - 1
          ? <button type="button" disabled={activeIndex + 1 > maxUnlocked} onClick={() => choosePhase(learningPhases[activeIndex + 1], activeIndex + 1)} className="learning-footer-link">Next phase <ChevronRight size={15} /></button>
          : <Link to="/learning" className="learning-footer-link">Finish learning <ArrowRight size={15} /></Link>}
      </footer>

      {message && <div role="status" className="learning-toast"><Sparkles size={17} />{message}<button type="button" onClick={() => setMessage('')} aria-label="Dismiss message"><RotateCcw size={14} /></button></div>}
    </div>
  );
}
