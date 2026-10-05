function hashString(value) {
  let hash = 2166136261;
  const str = String(value);
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36).toUpperCase().padStart(8, '0').slice(0, 8);
}

export function createCertificateId(email, careerId) {
  const careerCode = String(careerId || 'GEN').replace(/[^a-z0-9]/gi, '').slice(0, 4).toUpperCase();
  const year = new Date().getFullYear();
  const stable = hashString(`${String(email).trim().toLowerCase()}|${careerId}|careerai-passport`);
  return `CAI-${careerCode}-${year}-${stable}`;
}
