export function getNextJourneyStep({
  selectedCareer,
  learningProgress,
  assessmentData,
  mockInterviewData,
  jobsUnlocked,
  weakestSkill
}) {
  if (!selectedCareer) {
    return {
      title: 'Select a career path',
      detail: 'Choose a role to unlock its skills, assessments, and interview.',
      to: '/careers',
      cta: 'Explore careers'
    };
  }

  const startedLearning = Object.values(learningProgress || {}).some(Boolean);
  if (!startedLearning && !assessmentData?.[1]) {
    return {
      title: `Study ${selectedCareer.title} skills`,
      detail: 'Open a skill topic to explore key ideas, try a short exercise, and build a small project.',
      to: '/learning',
      cta: 'Open learning'
    };
  }

  if (!assessmentData?.[1]?.passed) {
    return {
      title: assessmentData?.[1] ? `Retry Stage 1${weakestSkill ? `: ${weakestSkill}` : ''}` : 'Start Stage 1 (Foundation)',
      detail: assessmentData?.[1]
        ? 'This retry uses unused questions when they remain. Later stages stay locked until you pass.'
        : 'Five randomized questions from the career skill bank. Pass at 60% to unlock Stage 2.',
      to: '/assessment/1',
      cta: assessmentData?.[1] ? 'Retry Stage 1' : 'Start Stage 1',
      secondaryTo: assessmentData?.[1] ? '/learning' : null,
      secondaryCta: assessmentData?.[1] ? 'Review learning' : null
    };
  }

  if (!assessmentData?.[2]?.passed) {
    return {
      title: assessmentData?.[2] ? 'Retry Stage 2 (Practical)' : 'Take Stage 2 (Practical)',
      detail: 'This stage prioritizes skills you missed earlier. Options are shuffled each attempt.',
      to: '/assessment/2',
      cta: 'Continue assessment'
    };
  }

  if (!assessmentData?.[3]?.passed) {
    return {
      title: assessmentData?.[3] ? 'Retry Stage 3 (Simulation)' : 'Take Stage 3 (Simulation)',
      detail: 'Pass this stage to unlock the mock interview. The certificate stays locked until the interview is passed.',
      to: '/assessment/3',
      cta: 'Continue assessment'
    };
  }

  if (!mockInterviewData?.passed) {
    return {
      title: mockInterviewData ? 'Retry the mock interview' : 'Complete the AI mock interview',
      detail: mockInterviewData
        ? 'Score was below 60%. Study weak areas, then retry with different questions. The passport stays locked.'
        : 'Answer in text or optional voice. Scoring uses expected concepts in your answers.',
      to: mockInterviewData ? '/mock-interview?attempt=new' : '/mock-interview',
      cta: mockInterviewData ? 'Retry interview' : 'Start interview',
      secondaryTo: mockInterviewData ? '/learning' : null,
      secondaryCta: mockInterviewData ? 'Recommended learning' : null
    };
  }

  if (!jobsUnlocked) {
    return {
      title: 'Issue your Digital Skill Passport',
      detail: 'Jobs unlock only after the certificate is generated with your real scores and stable ID.',
      to: '/certificate',
      cta: 'Open certificate'
    };
  }

  return {
    title: `Search ${selectedCareer.title} roles`,
    detail: 'Passport issued. Use the job hub for live portal searches.',
    to: '/jobs',
    cta: 'Job search',
    secondaryTo: '/certificate',
    secondaryCta: 'Certificate'
  };
}
