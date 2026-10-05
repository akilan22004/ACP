import { questions } from '../data/questions.js';

export const QUESTIONS_PER_STAGE = 5;
export const PASS_SCORE = 60;

export function shuffle(list) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function shuffleQuestionOptions(question) {
  const optionsWithIndex = question.options.map((text, originalIndex) => ({ text, originalIndex }));
  const shuffled = shuffle(optionsWithIndex);
  return {
    ...question,
    options: shuffled.map((item) => item.text),
    correct: shuffled.findIndex((item) => item.originalIndex === question.correct)
  };
}

function skillWeakness(skillScores) {
  const entries = Object.entries(skillScores || {});
  if (!entries.length) return {};
  const map = {};
  entries.forEach(([skill, data]) => {
    const total = data.total || 1;
    map[skill] = 1 - data.correct / total;
  });
  return map;
}

export function pickAdaptiveQuestions(careerId, stage, skillScores, usedIds = []) {
  const bank = questions.filter((q) => q.career === careerId && q.stage === stage);
  const unused = bank.filter((q) => !usedIds.includes(q.id));
  const pool = unused.length >= QUESTIONS_PER_STAGE ? unused : bank;

  const weakness = skillWeakness(skillScores);
  const ranked = [...pool].sort((a, b) => {
    const wa = weakness[a.skill] ?? 0.5;
    const wb = weakness[b.skill] ?? 0.5;
    if (stage === 1) return Math.random() - 0.5;
    return wb - wa || Math.random() - 0.5;
  });

  const selected = [];
  const seenSkills = new Set();

  ranked.forEach((q) => {
    if (selected.length >= QUESTIONS_PER_STAGE) return;
    if (!seenSkills.has(q.skill) || selected.length >= QUESTIONS_PER_STAGE - 1) {
      selected.push(q);
      seenSkills.add(q.skill);
    }
  });

  ranked.forEach((q) => {
    if (selected.length >= QUESTIONS_PER_STAGE) return;
    if (!selected.find((s) => s.id === q.id)) selected.push(q);
  });

  return shuffle(selected.slice(0, QUESTIONS_PER_STAGE)).map(shuffleQuestionOptions);
}

export function scoreAnswers(stageQuestions, answers, warningCount) {
  let correctCount = 0;
  const skillScores = {};

  stageQuestions.forEach((q) => {
    const isCorrect = answers[q.id] === q.correct;
    if (isCorrect) correctCount++;
    if (!skillScores[q.skill]) skillScores[q.skill] = { correct: 0, total: 0 };
    skillScores[q.skill].total += 1;
    if (isCorrect) skillScores[q.skill].correct += 1;
  });

  const raw = (correctCount / stageQuestions.length) * 100;
  const penalty = warningCount > 2 ? (warningCount - 2) * 5 : 0;
  const score = Math.max(0, Math.round(raw - penalty));

  return {
    score,
    passed: score >= PASS_SCORE,
    skillScores,
    correctCount,
    penalty
  };
}

export function recomputeSkillScores(assessmentData) {
  const totals = {};
  Object.values(assessmentData || {}).forEach((stage) => {
    Object.entries(stage.skillScores || {}).forEach(([skill, data]) => {
      if (!totals[skill]) totals[skill] = { correct: 0, total: 0 };
      totals[skill].correct += data.correct;
      totals[skill].total += data.total;
    });
  });
  return totals;
}

export function skillExtremes(skillScores) {
  let strongestSkill = null;
  let weakestSkill = null;
  let highest = -1;
  let lowest = 101;

  Object.entries(skillScores || {}).forEach(([skill, data]) => {
    if (!data.total) return;
    const percentage = (data.correct / data.total) * 100;
    if (percentage > highest) {
      highest = percentage;
      strongestSkill = skill;
    }
    if (percentage < lowest) {
      lowest = percentage;
      weakestSkill = skill;
    }
  });

  return { strongestSkill, weakestSkill };
}

export function readinessFromScore(overallScore) {
  if (overallScore >= 90) return 'Advanced';
  if (overallScore >= 75) return 'Job Ready';
  if (overallScore >= 60) return 'Intermediate';
  if (overallScore >= 40) return 'Developing';
  return 'Beginner';
}
