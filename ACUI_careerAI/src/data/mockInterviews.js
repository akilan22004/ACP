export const mockInterviewQuestions = {
  'java-full-stack': [
    {
      id: 'mi-jfs-1',
      question: "Explain the concept of Dependency Injection in Spring Boot and why it is useful.",
      expectedConcepts: ['inversion of control', 'ioc', 'loose coupling', 'autowired', 'bean', 'testing', 'modular']
    },
    {
      id: 'mi-jfs-2',
      question: "How does React handle state updates, and what is the role of the Virtual DOM?",
      expectedConcepts: ['usestate', 're-render', 'diffing', 'efficient', 'reconciliation', 'component', 'performance']
    },
    {
      id: 'mi-jfs-3',
      question: "Describe the differences between an INNER JOIN and a LEFT JOIN in SQL.",
      expectedConcepts: ['matching', 'intersection', 'all records from left', 'null', 'unmatched', 'tables']
    },
    {
      id: 'mi-jfs-4',
      question: "How would you design a REST API for a simple blog, including status codes and authentication?",
      expectedConcepts: ['get', 'post', 'put', 'delete', 'jwt', 'status', 'resource', 'json']
    },
    {
      id: 'mi-jfs-5',
      question: "Explain how you would debug a slow Spring Boot endpoint that queries a database.",
      expectedConcepts: ['index', 'n+1', 'query', 'log', 'profiling', 'join', 'cache']
    }
  ],
  'cloud-engineering': [
    {
      id: 'mi-cloud-1',
      question: 'How would you design a highly available web service across cloud zones?',
      expectedConcepts: ['availability zones', 'redundancy', 'load balancer', 'health checks', 'failover']
    },
    {
      id: 'mi-cloud-2',
      question: 'How would you respond to a sudden increase in application traffic?',
      expectedConcepts: ['metrics', 'horizontal scaling', 'autoscaling', 'load testing', 'capacity']
    },
    {
      id: 'mi-cloud-3',
      question: 'How would you protect sensitive data stored in a cloud object bucket?',
      expectedConcepts: ['least privilege', 'encryption', 'public access', 'identity', 'audit logs']
    },
    {
      id: 'mi-cloud-4',
      question: 'How would you investigate increased latency across cloud services?',
      expectedConcepts: ['metrics', 'logs', 'tracing', 'latency', 'dependency']
    },
    {
      id: 'mi-cloud-5',
      question: 'How would you safely review an infrastructure-as-code change?',
      expectedConcepts: ['version control', 'plan', 'review', 'state', 'rollback']
    }
  ],
  devops: [
    {
      id: 'mi-devops-1',
      question: 'What makes a continuous delivery pipeline safe and repeatable?',
      expectedConcepts: ['automated tests', 'versioned artifact', 'approval', 'deployment', 'rollback']
    },
    {
      id: 'mi-devops-2',
      question: 'A container restarts repeatedly after deployment. How would you investigate?',
      expectedConcepts: ['logs', 'health checks', 'resources', 'configuration', 'reproduce']
    },
    {
      id: 'mi-devops-3',
      question: 'How would you release a risky change while limiting customer impact?',
      expectedConcepts: ['canary', 'small percentage', 'monitoring', 'rollback', 'health']
    },
    {
      id: 'mi-devops-4',
      question: 'What signals help you understand production service health?',
      expectedConcepts: ['metrics', 'logs', 'traces', 'alerts', 'service level objective']
    },
    {
      id: 'mi-devops-5',
      question: 'How should a team handle configuration drift in managed infrastructure?',
      expectedConcepts: ['source of truth', 'plan', 'review', 'reconcile', 'version control']
    }
  ],
  'data-analyst': [
    {
      id: 'mi-da-1',
      question: "Walk me through the ETL process. What challenges do you typically face during the Transformation phase?",
      expectedConcepts: ['extract', 'transform', 'load', 'cleaning', 'normalization', 'missing values', 'duplicates', 'formatting']
    },
    {
      id: 'mi-da-2',
      question: "How would you explain statistical significance to a non-technical stakeholder?",
      expectedConcepts: ['p-value', 'chance', 'random', 'confidence', 'reliable', 'evidence', 'hypothesis']
    },
    {
      id: 'mi-da-3',
      question: "When would you choose to use a Scatter Plot over a Bar Chart?",
      expectedConcepts: ['relationship', 'correlation', 'two continuous variables', 'distribution', 'outliers', 'comparison']
    },
    {
      id: 'mi-da-4',
      question: "How do you validate that a dashboard metric matches the source data?",
      expectedConcepts: ['reconciliation', 'sql', 'sample', 'definition', 'grain', 'filters', 'source']
    },
    {
      id: 'mi-da-5',
      question: "Describe how you would clean a messy CSV before analysis.",
      expectedConcepts: ['missing', 'duplicate', 'type', 'outlier', 'standardize', 'null', 'format']
    }
  ],
  'data-scientist': [
    {
      id: 'mi-ds-1',
      question: "What is the bias-variance tradeoff in machine learning, and how do you handle it?",
      expectedConcepts: ['overfitting', 'underfitting', 'complexity', 'regularization', 'cross-validation', 'ensemble', 'error']
    },
    {
      id: 'mi-ds-2',
      question: "Explain how a Random Forest algorithm works compared to a single Decision Tree.",
      expectedConcepts: ['ensemble', 'multiple trees', 'bagging', 'voting', 'average', 'overfitting', 'robust']
    },
    {
      id: 'mi-ds-3',
      question: "How do you treat missing values in a dataset before training a model?",
      expectedConcepts: ['imputation', 'mean', 'median', 'drop', 'predictive', 'knn', 'domain knowledge']
    },
    {
      id: 'mi-ds-4',
      question: "How do you know if a classification model is actually useful in production?",
      expectedConcepts: ['precision', 'recall', 'f1', 'threshold', 'validation', 'drift', 'business']
    },
    {
      id: 'mi-ds-5',
      question: "Explain a pipeline from raw data to a trained scikit-learn model.",
      expectedConcepts: ['preprocess', 'split', 'pipeline', 'fit', 'transform', 'evaluate', 'leakage']
    }
  ],
  'business-analyst': [
    {
      id: 'mi-ba-1',
      question: "How do you prioritize conflicting requirements from different stakeholders?",
      expectedConcepts: ['moscow', 'value', 'impact', 'cost', 'negotiation', 'alignment', 'business goals']
    },
    {
      id: 'mi-ba-2',
      question: "Explain the difference between Agile and Waterfall methodologies. When would you use each?",
      expectedConcepts: ['iterative', 'sprints', 'flexible', 'sequential', 'phases', 'fixed scope', 'feedback']
    },
    {
      id: 'mi-ba-3',
      question: "What makes a good User Story? Explain the INVEST principle.",
      expectedConcepts: ['independent', 'negotiable', 'valuable', 'estimable', 'small', 'testable', 'persona', 'acceptance criteria']
    },
    {
      id: 'mi-ba-4',
      question: "How do you elicit requirements when stakeholders disagree on the problem?",
      expectedConcepts: ['workshop', 'interview', 'priority', 'goal', 'evidence', 'facilitation', 'scope']
    },
    {
      id: 'mi-ba-5',
      question: "Walk through how you would map an as-is process and propose a to-be process.",
      expectedConcepts: ['as-is', 'to-be', 'pain', 'handoff', 'bpmn', 'metric', 'stakeholder']
    }
  ],
  'qa-tester': [
    {
      id: 'mi-qa-1',
      question: "What is Regression Testing, and why is it critical in Agile environments?",
      expectedConcepts: ['new code', 'break existing', 'automation', 'continuous integration', 'sprints', 'defects', 'stability']
    },
    {
      id: 'mi-qa-2',
      question: "How do you handle a bug that a developer claims 'is not reproducible on their machine'?",
      expectedConcepts: ['environment', 'steps to reproduce', 'logs', 'screenshots', 'video', 'cache', 'browser version']
    },
    {
      id: 'mi-qa-3',
      question: "Explain the difference between Black Box testing and White Box testing.",
      expectedConcepts: ['internal structure', 'code', 'logic', 'functionality', 'user perspective', 'inputs and outputs', 'without knowing code']
    },
    {
      id: 'mi-qa-4',
      question: "How would you test a login API including negative cases?",
      expectedConcepts: ['status', 'auth', 'invalid', 'timeout', 'payload', 'security', 'boundary']
    },
    {
      id: 'mi-qa-5',
      question: "How do you decide what to automate versus what to test manually?",
      expectedConcepts: ['regression', 'repetitive', 'stable', 'exploratory', 'roi', 'flaky', 'priority']
    }
  ],
  'ui-ux-designer': [
    {
      id: 'mi-ux-1',
      question: "Walk me through your design process from receiving a brief to final handoff.",
      expectedConcepts: ['research', 'empathize', 'wireframe', 'prototype', 'testing', 'iterate', 'developer handoff', 'design system']
    },
    {
      id: 'mi-ux-2',
      question: "How do you ensure your designs are accessible to all users?",
      expectedConcepts: ['contrast', 'wcag', 'screen readers', 'keyboard navigation', 'alt text', 'color blindness', 'font size']
    },
    {
      id: 'mi-ux-3',
      question: "What is the difference between a wireframe and a prototype?",
      expectedConcepts: ['low-fidelity', 'layout', 'structure', 'high-fidelity', 'interactive', 'clickable', 'flow']
    },
    {
      id: 'mi-ux-4',
      question: "How do you turn usability findings into design changes?",
      expectedConcepts: ['pattern', 'priority', 'severity', 'iterate', 'hypothesis', 'task', 'evidence']
    },
    {
      id: 'mi-ux-5',
      question: "How would you design a form that is accessible and easy to complete?",
      expectedConcepts: ['label', 'error', 'focus', 'contrast', 'keyboard', 'required', 'helper']
    }
  ]
};

// Fallback if needed
export const defaultMockQuestions = [
  {
    id: 'mi-def-1',
    question: "Explain a complex technical concept you've recently learned to a beginner.",
    expectedConcepts: ['analogy', 'simple', 'clear', 'basics', 'understanding']
  },
  {
    id: 'mi-def-2',
    question: "How do you troubleshoot a difficult problem in your workflow?",
    expectedConcepts: ['isolate', 'logs', 'reproduce', 'research', 'documentation', 'ask for help']
  },
  {
    id: 'mi-def-3',
    question: "Describe how you keep up to date with new tools and practices in this field.",
    expectedConcepts: ['blogs', 'courses', 'community', 'projects', 'documentation', 'reading']
  }
];

export const getMockInterviewQuestions = (careerId) => {
  return mockInterviewQuestions[careerId] || defaultMockQuestions;
};

export const getInterviewScenario = (careerId) => {
  const scenarios = {
    'java-full-stack': 'A customer reports that a page sometimes shows stale data after saving. How would you investigate it?',
    'cloud-engineering': 'A cloud service becomes unavailable in one location during a traffic spike. How would you restore service and prevent a repeat?',
    devops: 'A deployment increases error rates shortly before a high-traffic period. How would you limit impact and coordinate the response?',
    'data-analyst': 'A stakeholder says a dashboard total does not match their spreadsheet. How would you work through it?',
    'data-scientist': 'A model performs well in testing but its results are getting worse after launch. What would you investigate?',
    'business-analyst': 'Two stakeholders disagree about which part of a new workflow matters most. How would you move the conversation forward?',
    'qa-tester': 'A release is due today, and one important bug only appears occasionally. How would you handle it?',
    'ui-ux-designer': 'Usability testing shows that people miss the main action on a screen. How would you improve it?'
  };
  return scenarios[careerId] || 'A teammate reports an unexpected result close to a deadline. How would you investigate it?';
};

export const getInterviewOutputQuestion = () => ({
  question: 'What do you think this small snippet prints? Take a moment to trace it.',
  code: 'const values = [2, 2, 5];\nconst result = values.filter((value, index) => values.indexOf(value) === index);\nconsole.log(result.length);',
  expected: ['2', 'It prints 2', 'the output is 2', '2 items']
});

export const getInterviewCodingChallenge = (careerId) => {
  const challenges = {
    'java-full-stack': {
      title: 'Prepare active user names',
      instructions: 'Return the names of active users, in their original order. This focused exercise runs JavaScript in an isolated browser sandbox.',
      functionName: 'activeUserNames',
      starterCode: 'function activeUserNames(users) {\n  // Return the names of active users\n  return [];\n}',
      tests: [
        { input: [{ name: 'Ava', active: true }, { name: 'Noah', active: false }, { name: 'Mina', active: true }], expected: ['Ava', 'Mina'], label: 'Keeps active users in order' },
        { input: [], expected: [], label: 'Handles an empty list' },
        { input: [{ name: 'Kai', active: false }], expected: [], label: 'Returns no inactive users' }
      ]
    },
    'data-analyst': {
      title: 'Calculate an average',
      instructions: 'Return the arithmetic mean of the values. Return 0 when the list is empty.',
      functionName: 'average',
      starterCode: 'function average(values) {\n  // Return the arithmetic mean, or 0 for an empty list\n  return 0;\n}',
      tests: [
        { input: [2, 4, 6], expected: 4, label: 'Averages three values' },
        { input: [], expected: 0, label: 'Handles an empty list' },
        { input: [5], expected: 5, label: 'Handles one value' }
      ]
    },
    'data-scientist': {
      title: 'Count values above a threshold',
      instructions: 'Return how many values are strictly greater than the supplied threshold.',
      functionName: 'countAbove',
      starterCode: 'function countAbove(values, threshold) {\n  // Count values strictly above the threshold\n  return 0;\n}',
      tests: [
        { input: [[1, 4, 7, 4], 4], expected: 1, label: 'Counts values strictly above' },
        { input: [[2, 3], 5], expected: 0, label: 'Returns zero when none qualify' },
        { input: [[], 0], expected: 0, label: 'Handles an empty list' }
      ]
    },
    'business-analyst': {
      title: 'Rank requirements by priority',
      instructions: 'Return a new array of requirement names, ordered by priority from highest to lowest. Do not mutate the input.',
      functionName: 'rankRequirements',
      starterCode: 'function rankRequirements(requirements) {\n  // Return names, highest priority first\n  return [];\n}',
      tests: [
        { input: [{ name: 'Reports', priority: 2 }, { name: 'Login', priority: 5 }], expected: ['Login', 'Reports'], label: 'Orders by priority' },
        { input: [], expected: [], label: 'Handles an empty list' },
        { input: [{ name: 'Search', priority: 3 }], expected: ['Search'], label: 'Handles one requirement' }
      ]
    },
    'qa-tester': {
      title: 'Check a simple email format',
      instructions: 'Return true when the value has non-space text before and after one @, with a dot in the part after @. Otherwise return false.',
      functionName: 'isValidEmail',
      starterCode: 'function isValidEmail(value) {\n  // Return true when the basic format is valid\n  return false;\n}',
      tests: [
        { input: 'qa@example.com', expected: true, label: 'Accepts a basic valid address' },
        { input: 'missing-at.example.com', expected: false, label: 'Rejects a missing @' },
        { input: 'name@localhost', expected: false, label: 'Rejects a missing dot after @' }
      ]
    },
    'ui-ux-designer': {
      title: 'Check whether a form can be submitted',
      instructions: 'Return true only when name and email are non-empty strings and the terms are accepted.',
      functionName: 'canSubmit',
      starterCode: 'function canSubmit(form) {\n  // Check the required fields and accepted terms\n  return false;\n}',
      tests: [
        { input: { name: 'Ari', email: 'ari@example.com', accepted: true }, expected: true, label: 'Accepts a complete form' },
        { input: { name: '', email: 'ari@example.com', accepted: true }, expected: false, label: 'Requires a name' },
        { input: { name: 'Ari', email: 'ari@example.com', accepted: false }, expected: false, label: 'Requires accepted terms' }
      ]
    },
    'cloud-engineering': {
      title: 'Estimate sample cloud costs',
      instructions: 'Return a cost rounded to two decimal places using the example rates in the starter code. These rates are for practice only, not provider pricing.',
      functionName: 'estimateSampleCost',
      starterCode: 'function estimateSampleCost(usage) {\n  // Example rates: compute $0.04/hour, storage $0.02/GB, transfer $0.09/GB\n  return 0;\n}',
      tests: [
        { input: { computeHours: 10, storageGb: 20, transferGb: 5 }, expected: 1.25, label: 'Adds compute, storage, and transfer costs' },
        { input: { computeHours: 0, storageGb: 0, transferGb: 0 }, expected: 0, label: 'Handles zero usage' },
        { input: { computeHours: 1, storageGb: 1, transferGb: 1 }, expected: 0.15, label: 'Rounds a small estimate to cents' }
      ]
    },
    devops: {
      title: 'List successful deployment runs',
      instructions: 'Return the IDs of successful deployment runs in their original order without changing the input.',
      functionName: 'successfulDeploymentIds',
      starterCode: 'function successfulDeploymentIds(runs) {\n  // Return IDs for successful runs, preserving order\n  return [];\n}',
      tests: [
        { input: [{ id: 'a1', status: 'success' }, { id: 'b2', status: 'failed' }, { id: 'c3', status: 'success' }], expected: ['a1', 'c3'], label: 'Keeps successful runs in order' },
        { input: [], expected: [], label: 'Handles an empty run list' },
        { input: [{ id: 'd4', status: 'running' }], expected: [], label: 'Excludes unfinished runs' }
      ]
    }
  };
  return challenges[careerId] || challenges['java-full-stack'];
};
