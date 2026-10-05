import assert from 'node:assert/strict';
import test from 'node:test';
import { careers } from './careers.js';
import { questions } from './questions.js';
import {
  getInterviewCodingChallenge,
  getInterviewScenario,
  getMockInterviewQuestions
} from './mockInterviews.js';
import { evaluateInterviewAnswers } from '../utils/interview.js';
import { pickAdaptiveQuestions, scoreStageAttempt } from '../utils/assessment.js';

test('every career has enough valid assessment questions for all three stages', () => {
  const questionIds = new Set();

  careers.forEach((career) => {
    [1, 2, 3].forEach((stage) => {
      const stageQuestions = questions.filter((question) => (
        question.career === career.id && question.stage === stage
      ));
      assert.ok(
        stageQuestions.length >= 5,
        `${career.id} stage ${stage} needs at least five questions`
      );

      stageQuestions.forEach((question) => {
        assert.ok(!questionIds.has(question.id), `duplicate question id: ${question.id}`);
        questionIds.add(question.id);
        assert.ok(question.options.length >= 2, `${question.id} needs answer options`);
        assert.ok(
          Number.isInteger(question.correct)
            && question.correct >= 0
            && question.correct < question.options.length,
          `${question.id} has an invalid answer key`
        );
      });
    });
  });
});

test('adaptive assessment selection preserves answer keys and scores only selected answers', () => {
  careers.forEach((career) => {
    [1, 2, 3].forEach((stage) => {
      const selected = pickAdaptiveQuestions(questions, {
        careerId: career.id,
        stage,
        skillScores: {},
        usedIds: [],
        count: 5
      });
      assert.equal(selected.length, 5, `${career.id} stage ${stage} selection`);
      assert.equal(new Set(selected.map(({ id }) => id)).size, 5);

      const allCorrect = Object.fromEntries(selected.map(({ id, correct }) => [id, correct]));
      const allWrong = Object.fromEntries(selected.map(({ id, correct, options }) => [
        id,
        (correct + 1) % options.length
      ]));
      assert.deepEqual(scoreStageAttempt(selected, allCorrect, 0).score, 100);
      assert.deepEqual(scoreStageAttempt(selected, allWrong, 0).score, 0);
    });
  });
});

test('assessment pass threshold and tab-switch penalties use configured scoring rules', () => {
  const stageQuestions = [
    { id: 'a', skill: 'A', correct: 0 },
    { id: 'b', skill: 'B', correct: 0 },
    { id: 'c', skill: 'C', correct: 0 },
    { id: 'd', skill: 'D', correct: 0 },
    { id: 'e', skill: 'E', correct: 0 }
  ];
  const answers = { a: 0, b: 0, c: 0, d: 1, e: 1 };

  assert.equal(scoreStageAttempt(stageQuestions, answers, 0).score, 60);
  assert.equal(scoreStageAttempt(stageQuestions, answers, 0).passed, true);
  assert.equal(scoreStageAttempt(stageQuestions, answers, 2).score, 60);
  assert.equal(scoreStageAttempt(stageQuestions, answers, 3).score, 55);
  assert.equal(scoreStageAttempt(stageQuestions, answers, 3).passed, false);
  assert.equal(scoreStageAttempt([], {}, 0).score, 0);
});

test('every career has career-specific interview questions, scenario, and coding task', () => {
  careers.forEach((career) => {
    const interviewQuestions = getMockInterviewQuestions(career.id);
    assert.ok(interviewQuestions.length >= 3, `${career.id} needs interview questions`);
    assert.ok(
      interviewQuestions.every(({ id }) => !id.startsWith('mi-def-')),
      `${career.id} must not use generic fallback interview questions`
    );
    assert.notEqual(
      getInterviewScenario(career.id),
      'A teammate reports an unexpected result close to a deadline. How would you investigate it?',
      `${career.id} needs a tailored interview scenario`
    );
    const challenge = getInterviewCodingChallenge(career.id);
    assert.ok(challenge.title && challenge.instructions && challenge.tests.length >= 2);
  });
});

test('role interview answers are scored from expected concepts rather than placeholders', () => {
  const cloudQuestions = getMockInterviewQuestions('cloud-engineering');
  const cloudQuestion = cloudQuestions[0];
  const cloudAnswer = cloudQuestion.expectedConcepts.join(', ');
  const cloudResult = evaluateInterviewAnswers(
    [cloudQuestion],
    { [cloudQuestion.id]: cloudAnswer }
  );
  assert.equal(cloudResult.score, 100);
  assert.equal(cloudResult.perQuestion[0].missed.length, 0);

  const devopsQuestion = getMockInterviewQuestions('devops')[0];
  const devopsResult = evaluateInterviewAnswers(
    [devopsQuestion],
    { [devopsQuestion.id]: '' }
  );
  assert.equal(devopsResult.score, 0);
  assert.equal(devopsResult.perQuestion[0].missed.length, devopsQuestion.expectedConcepts.length);
});
