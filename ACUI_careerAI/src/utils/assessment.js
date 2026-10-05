export function shuffle(list) {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
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

function skillWeakness(skillScores = {}) {
  return Object.entries(skillScores).map(([skill, data]) => {
    const total = data?.total || 0;
    const correct = data?.correct || 0;
    const ratio = total > 0 ? correct / total : 1;
    return { skill, ratio, total };
  }).sort((a, b) => a.ratio - b.ratio);
}

export function pickAdaptiveQuestions(allQuestions, { careerId, stage, skillScores, usedIds, count = 5 }) {
  const pool = allQuestions.filter((q) => q.career === careerId && q.stage === stage);
  if (pool.length === 0) return [];

  const unused = pool.filter((q) => !usedIds.includes(q.id));
  const used = pool.filter((q) => usedIds.includes(q.id));
  const source = unused.length >= count ? unused : [...unused, ...used];

  const weaknesses = skillWeakness(skillScores).filter((item) => item.total > 0);
  const weakSkills = new Set(weaknesses.slice(0, 3).map((item) => item.skill));

  let ranked = shuffle(source);
  if (stage > 1 && weakSkills.size > 0) {
    ranked = [
      ...ranked.filter((q) => weakSkills.has(q.skill)),
      ...ranked.filter((q) => !weakSkills.has(q.skill))
    ];
  }

  const unique = [];
  const seen = new Set();
  for (const question of ranked) {
    if (seen.has(question.id)) continue;
    seen.add(question.id);
    unique.push(question);
    if (unique.length === count) break;
  }

  while (unique.length < count && unique.length < pool.length) {
    const next = shuffle(pool).find((q) => !seen.has(q.id));
    if (!next) break;
    seen.add(next.id);
    unique.push(next);
  }

  return unique.map(shuffleQuestionOptions);
}

export function scoreStageAttempt(questions, answers, warningCount) {
  let correctCount = 0;
  const skillScores = {};

  questions.forEach((q) => {
    const isCorrect = answers[q.id] === q.correct;
    if (isCorrect) correctCount += 1;
    if (!skillScores[q.skill]) skillScores[q.skill] = { correct: 0, total: 0 };
    skillScores[q.skill].total += 1;
    if (isCorrect) skillScores[q.skill].correct += 1;
  });

  const raw = questions.length ? (correctCount / questions.length) * 100 : 0;
  const extraWarnings = Math.max(0, warningCount - 2);
  const penalty = extraWarnings * 5;
  const score = Math.round(Math.max(0, raw - penalty));

  return {
    score,
    passed: score >= 60,
    correctCount,
    penalty,
    skillScores
  };
}

export function recomputeSkillScores(assessmentData = {}) {
  const totals = {};
  [1, 2, 3].forEach((stage) => {
    const stageSkills = assessmentData[stage]?.skillScores || {};
    Object.entries(stageSkills).forEach(([skill, data]) => {
      if (!totals[skill]) totals[skill] = { correct: 0, total: 0 };
      totals[skill].correct += data.correct || 0;
      totals[skill].total += data.total || 0;
    });
  });
  return totals;
}

export function analyzeSkills(skillScores = {}) {
  let strongestSkill = null;
  let weakestSkill = null;
  let highest = -1;
  let lowest = 101;

  Object.entries(skillScores).forEach(([skill, data]) => {
    if (!data?.total) return;
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
