import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { loadUserProgress, saveUserProgress } from '../utils/storage';
import { analyzeSkills, recomputeSkillScores, readinessFromScore } from '../utils/assessment';
import { createCertificateId } from '../utils/ids';
import { careers } from '../data/careers';
import { canCompleteLearningPhase, getLearningTopicKey, getLearningTopicRecord, learningPhases, migrateLearningTopicRecords, normalizeLearningProgressState } from '../utils/learning';

const CareerContext = createContext();

const emptyState = {
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
};

export function CareerProvider({ children }) {
  const { currentUser, authReady } = useAuth();
  const [state, setState] = useState(emptyState);
  const stateRef = useRef(emptyState);
  const [loadedForEmail, setLoadedForEmail] = useState(null);
  const progressReady = authReady && loadedForEmail === (currentUser?.email || '');

  useEffect(() => {
    if (!authReady) return;
    if (!currentUser?.email) {
      stateRef.current = emptyState;
      setState(emptyState);
      setLoadedForEmail('');
      return;
    }
    const loadedState = migrateLearningTopicRecords(
      normalizeLearningProgressState(loadUserProgress(currentUser.email), careers)
    );
    stateRef.current = loadedState;
    setState(loadedState);
    setLoadedForEmail(currentUser.email);
  }, [currentUser?.email, authReady]);

  const persist = useCallback((updater) => {
    const prev = stateRef.current;
    const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
    if (next === prev) return false;
    stateRef.current = next;
    if (currentUser?.email) saveUserProgress(currentUser.email, next);
    setState(next);
    return true;
  }, [currentUser?.email]);

  const selectCareer = (career) => {
    persist({
      ...emptyState,
      selectedCareer: career
    });
  };

  const updateLearningProgress = (topicId, done) => {
    persist((prev) => {
      if (prev.learningProgress[topicId] === done) return prev;
      return {
        ...prev,
        learningProgress: { ...prev.learningProgress, [topicId]: done }
      };
    });
  };

  const updateRoadmapProgress = (topicId, itemId, done) => {
    persist((prev) => {
      const topicProgress = prev.roadmapProgress[topicId] || {};
      return {
        ...prev,
        roadmapProgress: {
          ...prev.roadmapProgress,
          [topicId]: { ...topicProgress, [itemId]: done }
        }
      };
    });
  };

  const recordLearningVisit = useCallback((careerId, topicId) => {
    if (!careerId || !topicId) return;
    const topicKey = getLearningTopicKey(careerId, topicId);
    persist((prev) => {
      if (prev.selectedCareer?.id !== careerId) return prev;
      const learningJourney = prev.learningJourney || { topics: {} };
      const topic = getLearningTopicRecord(learningJourney, careerId, topicId);
      return {
        ...prev,
        learningJourney: {
          ...learningJourney,
          topics: {
            ...learningJourney.topics,
            [topicKey]: { ...topic, lastVisitedAt: new Date().toISOString() }
          }
        }
      };
    });
  }, [persist]);

  const toggleLearningBookmark = useCallback((careerId, topicId) => {
    if (!careerId || !topicId) return;
    const topicKey = getLearningTopicKey(careerId, topicId);
    persist((prev) => {
      if (prev.selectedCareer?.id !== careerId) return prev;
      const learningJourney = prev.learningJourney || { topics: {} };
      const topic = getLearningTopicRecord(learningJourney, careerId, topicId);
      return {
        ...prev,
        learningJourney: {
          ...learningJourney,
          topics: {
            ...learningJourney.topics,
            [topicKey]: { ...topic, bookmarked: !topic.bookmarked }
          }
        }
      };
    });
  }, [persist]);

  const saveLearningDraft = useCallback((careerId, topicId, phaseId, draft) => {
    if (!careerId || !topicId || !['try', 'build'].includes(phaseId)) return;
    const topicKey = getLearningTopicKey(careerId, topicId);
    persist((prev) => {
      if (prev.selectedCareer?.id !== careerId) return prev;
      const learningJourney = prev.learningJourney || { topics: {} };
      const topic = getLearningTopicRecord(learningJourney, careerId, topicId);
      if (topic.drafts?.[phaseId] === draft) return prev;
      return {
        ...prev,
        learningJourney: {
          ...learningJourney,
          topics: {
            ...learningJourney.topics,
            [topicKey]: {
              ...topic,
              drafts: { ...topic.drafts, [phaseId]: draft }
            }
          }
        }
      };
    });
  }, [persist]);

  const completeLearningPhase = useCallback((careerId, topicId, phaseId, evidence = '') => {
    const currentState = stateRef.current;
    if (!careerId || !topicId || currentState.selectedCareer?.id !== careerId) return false;
    const phase = learningPhases.find((item) => item.id === phaseId);
    if (!phase) return false;
    const currentTopic = getLearningTopicRecord(currentState.learningJourney, careerId, topicId);
    const currentPhases = currentTopic.phases || {};
    if (!canCompleteLearningPhase(currentPhases, phaseId)) return false;
    const topicKey = getLearningTopicKey(careerId, topicId);
    return persist((prev) => {
      if (prev.selectedCareer?.id !== careerId) return prev;
      const learningJourney = prev.learningJourney || { topics: {} };
      const topic = getLearningTopicRecord(learningJourney, careerId, topicId);
      const phases = topic.phases || {};
      if (!canCompleteLearningPhase(phases, phaseId)) return prev;
      const completedAt = new Date().toISOString();
      const nextTopic = {
        ...topic,
        lastActivityAt: completedAt,
        phases: {
          ...phases,
          [phaseId]: {
            completedAt,
            xpAwarded: phase.xp,
            ...(evidence ? { evidence } : {})
          }
        }
      };
      return {
        ...prev,
        learningJourney: {
          ...learningJourney,
          topics: { ...learningJourney.topics, [topicKey]: nextTopic }
        }
      };
    });
  }, [persist]);

  const incrementWarning = () => {
    persist((prev) => ({ ...prev, antiCopyWarnings: prev.antiCopyWarnings + 1 }));
  };

  const mergeSkillMaps = (left = {}, right = {}) => {
    const merged = { ...left };
    Object.entries(right).forEach(([skill, data]) => {
      if (!merged[skill]) merged[skill] = { correct: 0, total: 0 };
      merged[skill] = {
        correct: (merged[skill].correct || 0) + (data.correct || 0),
        total: (merged[skill].total || 0) + (data.total || 0)
      };
    });
    return merged;
  };

  const saveAssessmentResult = (stage, payload) => {
    persist((prev) => {
      const previous = prev.assessmentData[stage];
      const keepUnlock = previous?.passed && !payload.passed;
      const stageRecord = keepUnlock
        ? {
            ...previous,
            lastAttemptScore: payload.score,
            skillScores: mergeSkillMaps(previous.skillScores, payload.skillScores),
            questionIds: [...new Set([...(previous.questionIds || []), ...(payload.questionIds || [])])]
          }
        : {
            score: payload.score,
            passed: payload.passed,
            answers: payload.answers,
            skillScores: payload.skillScores,
            questionIds: payload.questionIds
          };

      const assessmentData = {
        ...prev.assessmentData,
        [stage]: stageRecord
      };
      const usedForStage = prev.usedQuestionIds[stage] || [];
      const usedQuestionIds = {
        ...prev.usedQuestionIds,
        [stage]: [...new Set([...usedForStage, ...(payload.questionIds || [])])]
      };
      return {
        ...prev,
        assessmentData,
        usedQuestionIds,
        skillScores: recomputeSkillScores(assessmentData)
      };
    });
  };

  const saveMockInterviewResult = (result, questionIds) => {
    persist((prev) => {
      const mockInterviewData = {
        ...result,
        score: result.score,
        passed: result.passed,
        feedback: result.feedback,
        weakAreas: result.weakAreas || []
      };
      const next = {
        ...prev,
        mockInterviewData,
        usedInterviewIds: [...new Set([...(prev.usedInterviewIds || []), ...(questionIds || [])])]
      };
      if (!result.passed) {
        next.certificateData = null;
      }
      return next;
    });
  };

  const generateCertificate = useCallback((userData) => {
    persist((prev) => {
      if (!prev.selectedCareer || !userData) return prev;
      const stagesPassed = [1, 2, 3].every((stage) => prev.assessmentData[stage]?.passed);
      if (!stagesPassed || !prev.mockInterviewData?.passed) return prev;
      if (prev.certificateData?.id) return prev;

      const { strongestSkill, weakestSkill } = analyzeSkills(prev.skillScores);
      let passedCount = 0;
      let totalScore = 0;
      [1, 2, 3].forEach((stage) => {
        if (prev.assessmentData[stage]?.passed) {
          passedCount += 1;
          totalScore += prev.assessmentData[stage].score;
        }
      });
      const overallScore = passedCount ? Math.round(totalScore / passedCount) : 0;
      const readinessLevel = readinessFromScore(overallScore);

      return {
        ...prev,
        certificateData: {
          id: createCertificateId(userData.email, prev.selectedCareer.id),
          date: new Date().toLocaleDateString(),
          name: userData.name,
          career: prev.selectedCareer.title,
          overallScore,
          interviewScore: prev.mockInterviewData.score,
          readinessLevel,
          strongestSkill
        }
      };
    });
  }, [persist]);

  const {
    selectedCareer,
    learningProgress,
    assessmentData,
    skillScores,
    certificateData,
    roadmapProgress,
    learningJourney = { topics: {} },
    mockInterviewData,
    antiCopyWarnings,
    usedQuestionIds,
    usedInterviewIds
  } = state;

  const stage2Unlocked = assessmentData[1]?.passed || false;
  const stage3Unlocked = !!(assessmentData[1]?.passed && assessmentData[2]?.passed);
  const mockInterviewUnlocked = !!(assessmentData[1]?.passed && assessmentData[2]?.passed && assessmentData[3]?.passed);
  const certificateUnlocked = !!(mockInterviewUnlocked && mockInterviewData?.passed);
  const jobsUnlocked = !!(certificateUnlocked && certificateData);

  let passedCount = 0;
  let totalScore = 0;
  [1, 2, 3].forEach((stage) => {
    if (assessmentData[stage]?.passed) {
      passedCount += 1;
      totalScore += assessmentData[stage].score;
    }
  });
  const overallScore = passedCount ? Math.round(totalScore / passedCount) : 0;
  const readinessLevel = readinessFromScore(overallScore);
  const { strongestSkill, weakestSkill } = analyzeSkills(skillScores);

  return (
    <CareerContext.Provider value={{
      selectedCareer,
      progressReady,
      learningProgress,
      assessmentData,
      skillScores,
      certificateData,
      roadmapProgress,
      learningJourney,
      mockInterviewData,
      antiCopyWarnings,
      usedQuestionIds,
      usedInterviewIds,
      selectCareer,
      updateLearningProgress,
      updateRoadmapProgress,
      recordLearningVisit,
      toggleLearningBookmark,
      saveLearningDraft,
      completeLearningPhase,
      incrementWarning,
      saveAssessmentResult,
      saveMockInterviewResult,
      generateCertificate,
      stage2Unlocked,
      stage3Unlocked,
      mockInterviewUnlocked,
      certificateUnlocked,
      jobsUnlocked,
      overallScore,
      readinessLevel,
      strongestSkill,
      weakestSkill
    }}>
      {children}
    </CareerContext.Provider>
  );
}

export const useCareer = () => useContext(CareerContext);
