import { getAssessmentTopicMatch } from '../data/learning.js';

export const learningPhases = [
  { id: 'learn', label: 'Learn', xp: 25 },
  { id: 'try', label: 'Try', xp: 25 },
  { id: 'build', label: 'Build', xp: 50 }
];

export function getLearningTopicKey(careerId, topicId) {
  return careerId && topicId ? `${careerId}::${topicId}` : topicId;
}

function normalizeTopicRoutePart(value) {
  let decoded = String(value || '');
  try {
    decoded = decodeURIComponent(decoded);
  } catch {
    // Keep the original route segment when it contains invalid percent escapes.
  }
  return decoded
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function resolveLearningTopic(career, routeValue) {
  if (!Array.isArray(career?.topics) || !routeValue) return null;
  const routeKey = normalizeTopicRoutePart(routeValue);
  return career.topics.find((topic) => {
    if (!topic || typeof topic.id !== 'string' || typeof topic.name !== 'string') return false;
    const idKey = normalizeTopicRoutePart(topic.id);
    const nameKey = normalizeTopicRoutePart(topic.name);
    return routeKey === idKey || routeKey === nameKey
      || (routeKey.endsWith('-js') && routeKey.slice(0, -3) === nameKey);
  }) || null;
}

function asRecord(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

export function normalizeLearningProgressState(progress = {}, careerOptions = []) {
  const storedCareer = progress.selectedCareer;
  const storedCareerId = typeof storedCareer === 'string' ? storedCareer : storedCareer?.id;
  const canonicalCareer = careerOptions.find((career) => career.id === storedCareerId);
  const selectedCareer = canonicalCareer
    ? { ...(typeof storedCareer === 'object' ? storedCareer : {}), ...canonicalCareer }
    : null;
  const journey = asRecord(progress.learningJourney);

  return {
    ...progress,
    selectedCareer,
    learningProgress: asRecord(progress.learningProgress),
    roadmapProgress: asRecord(progress.roadmapProgress),
    learningJourney: {
      ...journey,
      topics: asRecord(journey.topics)
    }
  };
}

export function getLearningTopicRecord(learningJourney = {}, careerId, topicId) {
  const topics = asRecord(learningJourney?.topics);
  if (careerId) return topics[getLearningTopicKey(careerId, topicId)] || {};
  return topics[topicId] || {};
}

function comparableRecord(record) {
  if (Array.isArray(record)) return record.map(comparableRecord);
  if (!record || typeof record !== 'object') return record;
  return Object.fromEntries(Object.keys(record).sort().map((key) => [key, comparableRecord(record[key])]));
}

export function migrateLearningTopicRecords(progress = {}) {
  const career = progress.selectedCareer;
  const journey = progress.learningJourney;
  const topics = journey?.topics;
  if (!career?.id || !Array.isArray(career.topics) || !topics) return progress;

  const migratedTopics = { ...topics };
  const legacyTopicAliases = { ...(journey.legacyTopicAliases || {}) };
  let changed = false;
  career.topics.forEach(({ id }) => {
    const scopedKey = getLearningTopicKey(career.id, id);
    if (!Object.hasOwn(topics, id)) return;
    if (!Object.hasOwn(migratedTopics, scopedKey)) {
      migratedTopics[scopedKey] = topics[id];
      legacyTopicAliases[scopedKey] = id;
      changed = true;
    } else if (!Object.hasOwn(legacyTopicAliases, scopedKey)
      && JSON.stringify(comparableRecord(migratedTopics[scopedKey])) === JSON.stringify(comparableRecord(topics[id]))) {
      legacyTopicAliases[scopedKey] = id;
      changed = true;
    }
  });

  return !changed
    ? progress
    : { ...progress, learningJourney: { ...journey, topics: migratedTopics, legacyTopicAliases } };
}

export function canCompleteLearningPhase(phases = {}, phaseId) {
  if (!learningPhases.some((phase) => phase.id === phaseId) || phases[phaseId]?.completedAt) return false;
  if (phaseId === 'try' && !phases.learn?.completedAt) return false;
  if (phaseId === 'build' && !phases.try?.completedAt) return false;
  return true;
}

export function getLearningTopicProgress(topicId, learningJourney = {}, legacyPercent = 0, legacyComplete = false, careerId) {
  const topic = getLearningTopicRecord(learningJourney, careerId, topicId);
  const phases = topic.phases || {};
  const effectivePhases = legacyComplete
    ? Object.fromEntries(learningPhases.map((phase) => [phase.id, phases[phase.id] || { completedAt: 'legacy', xpAwarded: 0 }]))
    : phases;
  const completedCount = learningPhases.filter((phase) => effectivePhases[phase.id]?.completedAt).length;
  const percent = legacyComplete ? 100 : Math.max(legacyPercent, Math.round((completedCount / learningPhases.length) * 100));
  let status = 'Not started';
  if (percent === 100) status = 'Mastered';
  else if (effectivePhases.try?.completedAt || effectivePhases.learn?.completedAt) status = 'Practicing';
  else if (topic.lastVisitedAt || legacyPercent > 0) status = 'Learning';

  return {
    percent,
    status,
    completedCount,
    phases: effectivePhases,
    isBookmarked: !!topic.bookmarked,
    lastVisitedAt: topic.lastVisitedAt || null,
    lastActivityAt: topic.lastActivityAt || null,
    lockedPhase: !effectivePhases.learn?.completedAt ? 'try' : !effectivePhases.try?.completedAt ? 'build' : null
  };
}

export function getLearningActivityStats(learningJourney = {}) {
  const aliases = new Set(Object.values(learningJourney.legacyTopicAliases || {}));
  const topicRecords = Object.entries(learningJourney.topics || {})
    .filter(([topicKey]) => !aliases.has(topicKey))
    .map(([, topic]) => topic);
  const completions = topicRecords.flatMap((topic) => Object.values(topic.phases || {}))
    .filter((phase) => phase?.completedAt);
  const xp = completions.reduce((total, phase) => total + (phase.xpAwarded || 0), 0);
  const activeDays = new Set(completions.map((phase) => {
    const date = new Date(phase.completedAt);
    if (Number.isNaN(date.getTime())) return null;
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  }).filter(Boolean));

  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  const todayKey = `${cursor.getFullYear()}-${cursor.getMonth()}-${cursor.getDate()}`;
  if (!activeDays.has(todayKey)) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (activeDays.has(`${cursor.getFullYear()}-${cursor.getMonth()}-${cursor.getDate()}`)) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return { xp, streak, completedActivities: completions.length };
}

export function getResumeTopic(topics = [], learningJourney = {}, progressByTopic = {}, careerId) {
  const incomplete = topics.filter((topic) => getLearningTopicProgress(
    topic.id,
    learningJourney,
    progressByTopic[topic.id]?.percent || 0,
    progressByTopic[topic.id]?.complete,
    careerId
  ).status !== 'Mastered');
  const visited = incomplete
    .map((topic) => ({ topic, time: getLearningTopicRecord(learningJourney, careerId, topic.id).lastVisitedAt }))
    .filter((item) => item.time && !Number.isNaN(new Date(item.time).getTime()))
    .sort((a, b) => new Date(b.time) - new Date(a.time));
  return visited[0]?.topic || incomplete[0] || topics[0] || null;
}

export function getRecommendedTopic(topics = [], weakestSkill, learningJourney = {}, progressByTopic = {}, careerId) {
  const incomplete = topics.filter((topic) => getLearningTopicProgress(
    topic.id,
    learningJourney,
    progressByTopic[topic.id]?.percent || 0,
    progressByTopic[topic.id]?.complete,
    careerId
  ).status !== 'Mastered');
  if (!incomplete.length) return null;
  if (weakestSkill) {
    const weakMatch = incomplete.find((topic) => getAssessmentTopicMatch(topic.name, weakestSkill));
    if (weakMatch) return weakMatch;
  }
  return incomplete[0];
}