const progressKey = (email) => `careerai_progress_${email}`;

const emptyProgress = () => ({
  selectedCareer: null,
  learningProgress: {},
  assessmentData: {},
  skillScores: {},
  certificateData: null,
  roadmapProgress: {},
  mockInterviewData: null,
  antiCopyWarnings: 0,
  usedQuestionIds: { 1: [], 2: [], 3: [] },
  usedInterviewIds: []
});

export function loadUserProgress(email) {
  if (!email) return emptyProgress();
  try {
    const raw = localStorage.getItem(progressKey(email));
    if (!raw) return emptyProgress();
    return { ...emptyProgress(), ...JSON.parse(raw) };
  } catch {
    return emptyProgress();
  }
}

export function saveUserProgress(email, data) {
  if (!email) return;
  localStorage.setItem(progressKey(email), JSON.stringify(data));
}

export function stableCertificateId(email, careerId) {
  const input = `${email}|${careerId}|careerai-passport`;
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const token = (hash >>> 0).toString(36).toUpperCase().padStart(8, '0').slice(0, 8);
  const careerCode = (careerId || 'GEN').replace(/[^a-z0-9]/gi, '').substring(0, 4).toUpperCase();
  return `CAI-${careerCode}-${new Date().getFullYear()}-${token}`;
}
