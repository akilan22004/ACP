const USERS_KEY = 'careerai_users';
const SESSION_KEY = 'careerai_current_user';

export function clearLegacySession() {
  localStorage.removeItem(SESSION_KEY);
}

export function findLegacyUser(email, password) {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  let users;
  try {
    users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  } catch {
    return null;
  }
  if (!Array.isArray(users)) return null;
  const user = users.find((entry) => (
    typeof entry?.email === 'string'
    && entry.email.trim().toLowerCase() === normalizedEmail
    && entry.password === password
  ));
  return user ? { name: user.name, email: normalizedEmail } : null;
}

export function removeLegacyUser(email) {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  let users;
  try {
    users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  } catch {
    localStorage.removeItem(USERS_KEY);
    return;
  }
  if (!Array.isArray(users)) {
    localStorage.removeItem(USERS_KEY);
    return;
  }
  const remaining = users.filter((user) => user?.email?.trim?.().toLowerCase() !== normalizedEmail);
  if (remaining.length) {
    localStorage.setItem(USERS_KEY, JSON.stringify(remaining));
  } else {
    localStorage.removeItem(USERS_KEY);
  }
}

export function progressKey(email) {
  return `careerai_progress_${String(email || '').trim().toLowerCase()}`;
}

const emptyProgress = () => ({
  selectedCareer: null,
  learningProgress: {},
  assessmentData: {},
  skillScores: {},
  certificateData: null,
  roadmapProgress: {},
  learningJourney: { topics: {} },
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

export function saveUserProgress(email, progress) {
  if (!email) return;
  localStorage.setItem(progressKey(email), JSON.stringify(progress));
}
