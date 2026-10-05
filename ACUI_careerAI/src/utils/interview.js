import { shuffle } from './assessment.js';

export function pickInterviewQuestions(bank, usedIds, count = 4) {
  const unused = bank.filter((q) => !usedIds.includes(q.id));
  const used = bank.filter((q) => usedIds.includes(q.id));
  const source = unused.length >= count ? unused : [...unused, ...used];
  const unique = [];
  const seen = new Set();
  for (const question of shuffle(source)) {
    if (seen.has(question.id)) continue;
    seen.add(question.id);
    unique.push(question);
    if (unique.length === count) break;
  }
  return unique;
}

function normalize(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const conceptAliases = {
  'inversion of control': ['framework creates dependencies', 'container manages objects'],
  ioc: ['inversion of control', 'container manages objects'],
  autowired: ['dependency injection', 'inject dependency'],
  'loose coupling': ['independent components', 'less dependent'],
  usestate: ['state hook', 'component state'],
  're render': ['render again', 'updates the view'],
  diffing: ['compare virtual dom', 'compare changes'],
  reconciliation: ['update only changed parts', 'virtual dom comparison'],
  'all records from left': ['every row from the left table', 'keep unmatched left rows'],
  null: ['empty value', 'no matching row'],
  extract: ['collect data', 'get data from sources'],
  transform: ['clean data', 'reshape data', 'change data format'],
  load: ['write data to destination', 'store data'],
  overfitting: ['memorizes training data', 'performs poorly on new data'],
  underfitting: ['model is too simple', 'misses patterns'],
  imputation: ['fill missing values', 'replace missing data'],
  'multiple trees': ['many decision trees', 'collection of trees'],
  bagging: ['bootstrap samples', 'train on random samples'],
  iterative: ['repeated cycles', 'work in increments'],
  sequential: ['one phase after another', 'fixed sequence'],
  'steps to reproduce': ['reproduction steps', 'repeat the issue'],
  'user perspective': ['test without knowing the code', 'based on external behavior'],
  'internal structure': ['inspect the code', 'inside the implementation'],
  wireframe: ['rough layout', 'low fidelity layout'],
  prototype: ['interactive mockup', 'clickable model'],
  'screen readers': ['assistive technology', 'read content aloud'],
  'keyboard navigation': ['navigate without a mouse', 'keyboard accessible'],
  bean: ['managed object created by spring', 'spring managed component'],
  testing: ['unit tests', 'verify behavior with tests'],
  modular: ['separate modules', 'independent pieces'],
  performance: ['faster rendering', 'reduce unnecessary work'],
  status: ['http status code', 'response code'],
  resource: ['api endpoint', 'thing the api manages'],
  'p value': ['probability under the null hypothesis', 'probability value'],
  reliable: ['unlikely to be random', 'repeatable evidence'],
  relationship: ['how two variables change together', 'association between variables'],
  comparison: ['compare categories', 'compare groups'],
  distribution: ['spread of values', 'shape of the data'],
  source: ['original data', 'source of truth'],
  'missing values': ['empty cells', 'incomplete records'],
  duplicates: ['repeated rows', 'duplicate records'],
  'cross validation': ['validation folds', 'test across multiple splits'],
  ensemble: ['combine several models', 'collection of models'],
  'business goals': ['business outcomes', 'organization objectives'],
  feedback: ['input from users', 'stakeholder response'],
  'acceptance criteria': ['conditions for completion', 'definition of done'],
  scope: ['what is included', 'boundaries of the work'],
  stability: ['avoid regressions', 'keep existing behavior working'],
  exploratory: ['investigate without a fixed script', 'learn through testing'],
  contrast: ['text and background difference', 'color contrast ratio'],
  label: ['input description', 'field name']
};

function conceptHit(answer, concept) {
  const haystack = normalize(answer);
  const needle = normalize(concept);
  if (!needle) return false;
  if (haystack.includes(needle)) return true;

  const aliases = conceptAliases[needle] || [];
  return aliases.some((alias) => haystack.includes(normalize(alias)));
}

export function evaluateInterviewAnswers(questions, answers) {
  let totalScore = 0;
  const perQuestion = [];

  questions.forEach((q) => {
    const answer = String(answers[q.id] || '');
    const matched = [];
    const missed = [];

    q.expectedConcepts.forEach((concept) => {
      if (conceptHit(answer, concept)) matched.push(concept);
      else missed.push(concept);
    });

    const coverage = q.expectedConcepts.length ? matched.length / q.expectedConcepts.length : 0;
  const qScore = Math.round(coverage * 100);

    totalScore += qScore;
    perQuestion.push({
      id: q.id,
      question: q.question,
      score: qScore,
      matched,
      missed
    });
  });

  const score = questions.length ? Math.round(totalScore / questions.length) : 0;
  const passed = score >= 60;
  const weakAreas = [...new Set(perQuestion.flatMap((item) => item.missed))].slice(0, 8);

  const feedback = perQuestion.map((item) => {
    if (item.score >= 70) {
      return `On "${item.question}" you covered ${item.matched.slice(0, 3).join(', ') || 'the main ideas'}.`;
    }
    if (item.score > 0) {
      return `You have part of the idea on "${item.question}". A useful next point to explore is ${item.missed.slice(0, 2).join(' or ')}.`;
    }
    return `For "${item.question}", review ${item.missed.slice(0, 3).join(', ')} and try explaining it in your own words.`;
  }).join(' ');

  return { score, passed, feedback, weakAreas, perQuestion };
}

export function runInterviewCode(source, challenge) {
  return new Promise((resolve) => {
    const frame = document.createElement('iframe');
    frame.setAttribute('sandbox', 'allow-scripts');
    frame.setAttribute('title', 'Isolated interview code runner');
    frame.style.cssText = 'position:fixed;width:1px;height:1px;left:-10px;top:-10px;border:0';
    frame.srcdoc = `<!doctype html><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval'; connect-src 'none'; form-action 'none'; base-uri 'none'"><script>
      addEventListener('message', (event) => {
        const { code, functionName, tests } = event.data || {};
        const results = tests.map((test) => {
          try {
            const execute = new Function('input', code + '; return ' + functionName + '(input);');
            const actual = execute(test.input);
            return { label: test.label, passed: JSON.stringify(actual) === JSON.stringify(test.expected), actual };
          } catch (error) {
            return { label: test.label, passed: false, error: error.message };
          }
        });
        parent.postMessage({ type: 'interview-code-results', results }, '*');
      }, { once: true });
    <\/script>`;

    const timeout = window.setTimeout(() => {
      frame.remove();
      resolve({ timedOut: true, results: [] });
    }, 1500);

    const handleMessage = (event) => {
      if (event.source !== frame.contentWindow || event.data?.type !== 'interview-code-results') return;
      window.clearTimeout(timeout);
      window.removeEventListener('message', handleMessage);
      frame.remove();
      resolve({ timedOut: false, results: event.data.results });
    };

    window.addEventListener('message', handleMessage);
    frame.onload = () => frame.contentWindow.postMessage({
      code: source,
      functionName: challenge.functionName,
      tests: challenge.tests
    }, '*');
    document.body.appendChild(frame);
  });
}
