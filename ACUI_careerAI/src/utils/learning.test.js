import test from 'node:test';
import assert from 'node:assert/strict';
import {
  canCompleteLearningPhase,
  getLearningActivityStats,
  getLearningTopicProgress,
  getLearningTopicRecord,
  getLearningTopicKey,
  migrateLearningTopicRecords,
  normalizeLearningProgressState,
  resolveLearningTopic
} from './learning.js';
import { careers } from '../data/careers.js';
import { getRoadmap } from '../data/roadmaps.js';

test('saved career and learning records are normalized to current canonical data', () => {
  const normalized = normalizeLearningProgressState({
    selectedCareer: { id: 'java-full-stack', title: 'Old title' },
    learningJourney: null,
    learningProgress: null,
    roadmapProgress: null
  }, careers);

  assert.equal(normalized.selectedCareer.title, 'Java Full Stack Developer');
  assert.deepEqual(normalized.selectedCareer.topics, careers[0].topics);
  assert.deepEqual(normalized.learningJourney.topics, {});
  assert.deepEqual(normalized.learningProgress, {});
  assert.deepEqual(normalized.roadmapProgress, {});
});

test('legacy string career identifiers resolve to canonical career records', () => {
  const normalized = normalizeLearningProgressState({
    selectedCareer: 'java-full-stack',
    learningJourney: { topics: { t3: { bookmarked: true } } }
  }, careers);

  assert.equal(normalized.selectedCareer.id, 'java-full-stack');
  assert.equal(normalized.selectedCareer.topics[2].name, 'HTML/CSS');
  assert.equal(normalized.learningJourney.topics.t3.bookmarked, true);
});

test('unsupported or malformed saved careers cannot reach the lesson with invalid topic data', () => {
  const normalized = normalizeLearningProgressState({
    selectedCareer: { id: 'removed-career', topics: [null] },
    learningJourney: { topics: {} }
  }, careers);

  assert.equal(normalized.selectedCareer, null);
});

test('lesson routes resolve by canonical ID, case-insensitive name, or normalized slug', () => {
  const career = careers[0];

  assert.equal(resolveLearningTopic(career, 't3'), career.topics[2]);
  assert.equal(resolveLearningTopic(career, 'HTML%20%26%20CSS'), career.topics[2]);
  assert.equal(resolveLearningTopic(career, 'html-css'), career.topics[2]);
  assert.equal(resolveLearningTopic(career, 'REACT.JS'), career.topics[4]);
  assert.equal(resolveLearningTopic(career, 'unknown-course'), null);
});

test('every canonical career topic resolves to its real course data', () => {
  careers.forEach((career) => {
    career.topics.forEach((topic) => {
      assert.equal(resolveLearningTopic(career, topic.id), topic);
      const course = getRoadmap(topic.name);
      assert.ok(course.project.title);
      assert.ok(course.concepts.length > 0);
    });
  });

  const fullStack = careers.find(({ id }) => id === 'java-full-stack');
  const htmlCss = resolveLearningTopic(fullStack, 'html-css');
  assert.equal(htmlCss.id, 't3');
  assert.ok(getRoadmap(htmlCss.name).youtube.some(({ title }) => title.toLowerCase().includes('flexbox')));
});

test('legacy topic records migrate to selected career keys without deleting originals', () => {
  const legacyRecord = { bookmarked: true, drafts: { try: 'saved note' } };
  const existingScoped = { bookmarked: false };
  const state = {
    selectedCareer: { id: 'java-full-stack', topics: [{ id: 't1' }, { id: 't3' }] },
    learningJourney: {
      topics: {
        t1: legacyRecord,
        t3: { phases: { learn: { completedAt: '2026-01-01' } } },
        'java-full-stack::t3': existingScoped
      }
    }
  };

  const migrated = migrateLearningTopicRecords(state);

  assert.equal(migrated.learningJourney.topics['java-full-stack::t1'], legacyRecord);
  assert.equal(migrated.learningJourney.topics.t1, legacyRecord);
  assert.equal(migrated.learningJourney.topics['java-full-stack::t3'], existingScoped);
  assert.equal(migrated.learningJourney.topics.t3.phases.learn.completedAt, '2026-01-01');
});

test('activity totals remain unchanged when legacy records are migrated or already copied', () => {
  const legacyRecord = {
    phases: {
      learn: { completedAt: '2026-01-01T00:00:00.000Z', xpAwarded: 25 },
      try: { completedAt: '2026-01-02T00:00:00.000Z', xpAwarded: 25 }
    }
  };
  const state = {
    selectedCareer: { id: 'java-full-stack', topics: [{ id: 't3' }] },
    learningJourney: { topics: { t3: legacyRecord } }
  };
  const before = getLearningActivityStats(state.learningJourney);
  const firstMigration = migrateLearningTopicRecords(state);
  const afterFirstMigration = getLearningActivityStats(firstMigration.learningJourney);
  const secondMigration = migrateLearningTopicRecords(firstMigration);
  const afterReloadMigration = getLearningActivityStats(secondMigration.learningJourney);

  assert.deepEqual(afterFirstMigration, before);
  assert.deepEqual(afterReloadMigration, before);
  assert.equal(secondMigration.learningJourney.topics.t3, legacyRecord);
  assert.equal(secondMigration.learningJourney.topics['java-full-stack::t3'], legacyRecord);
  assert.deepEqual(secondMigration.learningJourney.legacyTopicAliases, { 'java-full-stack::t3': 't3' });
});

test('a matching existing scoped copy is marked as an alias but distinct career records remain counted', () => {
  const migratedCopy = {
    phases: { learn: { completedAt: '2026-02-01T00:00:00.000Z', xpAwarded: 25 } }
  };
  const distinctCareerRecord = {
    phases: { build: { completedAt: '2026-02-02T00:00:00.000Z', xpAwarded: 50 } }
  };
  const state = {
    selectedCareer: { id: 'java-full-stack', topics: [{ id: 't1' }] },
    learningJourney: {
      topics: {
        t1: migratedCopy,
        'java-full-stack::t1': { ...migratedCopy },
        'data-analyst::t1': distinctCareerRecord
      }
    }
  };
  const migrated = migrateLearningTopicRecords(state);
  const stats = getLearningActivityStats(migrated.learningJourney);

  assert.deepEqual(migrated.learningJourney.legacyTopicAliases, { 'java-full-stack::t1': 't1' });
  assert.equal(stats.xp, 75);
  assert.equal(stats.completedActivities, 2);
});

test('topic progress and record reads remain isolated by career after migration', () => {
  const journey = {
    topics: {
      'java-full-stack::t3': { bookmarked: true, phases: { learn: { completedAt: 'done' } } },
      'data-analyst::t3': { bookmarked: false, phases: {} }
    }
  };

  assert.equal(getLearningTopicRecord(journey, 'java-full-stack', 't3').bookmarked, true);
  assert.equal(getLearningTopicRecord(journey, 'data-analyst', 't3').bookmarked, false);
  assert.equal(getLearningTopicProgress('t3', journey, 0, false, 'java-full-stack').completedCount, 1);
  assert.equal(getLearningTopicProgress('t3', journey, 0, false, 'data-analyst').completedCount, 0);
  assert.equal(getLearningTopicKey('data-analyst', 't3'), 'data-analyst::t3');
  assert.deepEqual(getLearningTopicRecord({ topics: { t3: { bookmarked: true } } }, 'data-analyst', 't3'), {});
});

test('legacy mastery does not permit completion feedback for unpersisted sequential phases', () => {
  assert.equal(canCompleteLearningPhase({}, 'build'), false);
  assert.equal(canCompleteLearningPhase({}, 'try'), false);
  assert.equal(canCompleteLearningPhase({}, 'learn'), true);
  assert.equal(canCompleteLearningPhase({ learn: { completedAt: 'legacy' } }, 'try'), true);
  assert.equal(canCompleteLearningPhase({
    learn: { completedAt: 'legacy' },
    try: { completedAt: 'legacy' },
    build: { completedAt: 'legacy' }
  }, 'build'), false);
});
