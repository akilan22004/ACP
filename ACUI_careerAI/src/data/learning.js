import { questions } from './questions.js';

const levels = {
  'Java': 'Beginner',
  'OOP': 'Beginner',
  'HTML/CSS': 'Beginner',
  'JavaScript': 'Beginner',
  'React': 'Intermediate',
  'Spring Boot': 'Intermediate',
  'SQL': 'Beginner',
  'REST API': 'Intermediate',
  'Python': 'Beginner',
  'Excel': 'Beginner',
  'Statistics': 'Beginner',
  'Data Visualization': 'Intermediate',
  'Tableau/Power BI': 'Intermediate',
  'ETL': 'Intermediate',
  'Business Intelligence': 'Intermediate',
  'Machine Learning': 'Intermediate',
  'Data Preprocessing': 'Intermediate',
  'Scikit-learn': 'Intermediate',
  'Deep Learning': 'Advanced',
  'Model Evaluation': 'Intermediate',
  'Feature Engineering': 'Advanced',
  'Requirements Gathering': 'Beginner',
  'SWOT Analysis': 'Beginner',
  'UML Diagrams': 'Intermediate',
  'Stakeholder Management': 'Intermediate',
  'Agile/Scrum': 'Beginner',
  'JIRA': 'Beginner',
  'Business Process Modeling': 'Intermediate',
  'Reporting': 'Beginner',
  'Manual Testing': 'Beginner',
  'Test Cases': 'Beginner',
  'Selenium': 'Intermediate',
  'API Testing': 'Intermediate',
  'Bug Reporting': 'Beginner',
  'Agile Testing': 'Intermediate',
  'Test Planning': 'Intermediate',
  'Figma': 'Beginner',
  'Design Principles': 'Beginner',
  'User Research': 'Beginner',
  'Wireframing': 'Beginner',
  'Prototyping': 'Intermediate',
  'Usability Testing': 'Intermediate',
  'Color Theory': 'Beginner',
  'Accessibility': 'Intermediate'
};

const aliases = {
  java: ['java basics'],
  'requirements gathering': ['business analysis'],
  'swot analysis': ['business analysis'],
  'tableau power bi': ['business intelligence'],
  'data visualization': ['business intelligence'],
  'agile scrum': ['agile testing'],
  'rest api': ['api testing'],
  'manual testing': ['test cases'],
  'model evaluation': ['machine learning'],
  'design principles': ['wireframing']
};

const normalize = (value) => String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const unavailableThumbnails = new Set(['K3pXnbNL9W0', 'sEW5eVbbcmA', 'nKJtZau2n-I']);

const studyResources = {
  'java': [
    { title: 'Learn Java', source: 'dev.java', url: 'https://dev.java/learn/' },
    { title: 'The Java Tutorials', source: 'Oracle', url: 'https://docs.oracle.com/javase/tutorial/' }
  ],
  'oop': [
    { title: 'Object-Oriented Programming Concepts', source: 'Oracle', url: 'https://docs.oracle.com/javase/tutorial/java/concepts/' },
    { title: 'Classes and Objects', source: 'dev.java', url: 'https://dev.java/learn/classes-objects/' }
  ],
  'html css': [
    { title: 'Learn HTML', source: 'MDN', url: 'https://developer.mozilla.org/en-US/docs/Learn/HTML' },
    { title: 'Learn CSS', source: 'MDN', url: 'https://developer.mozilla.org/en-US/docs/Learn/CSS' }
  ],
  'javascript': [
    { title: 'JavaScript Guide', source: 'MDN', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide' },
    { title: 'The Modern JavaScript Tutorial', source: 'javascript.info', url: 'https://javascript.info/' }
  ],
  'react': [
    { title: 'Learn React', source: 'React', url: 'https://react.dev/learn' },
    { title: 'Thinking in React', source: 'React', url: 'https://react.dev/learn/thinking-in-react' }
  ],
  'spring boot': [
    { title: 'Spring Boot Guides', source: 'Spring', url: 'https://spring.io/guides' },
    { title: 'Spring Boot Reference', source: 'Spring', url: 'https://docs.spring.io/spring-boot/reference/' }
  ],
  'sql': [
    { title: 'PostgreSQL Tutorial', source: 'PostgreSQL', url: 'https://www.postgresql.org/docs/current/tutorial.html' },
    { title: 'SQL Tutorial', source: 'W3Schools', url: 'https://www.w3schools.com/sql/' }
  ],
  'rest api': [
    { title: 'HTTP Overview', source: 'MDN', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview' },
    { title: 'REST API Design Best Practices', source: 'Microsoft Learn', url: 'https://learn.microsoft.com/en-us/azure/architecture/best-practices/api-design' }
  ],
  'python': [
    { title: 'The Python Tutorial', source: 'Python.org', url: 'https://docs.python.org/3/tutorial/' },
    { title: 'Data Structures', source: 'Python.org', url: 'https://docs.python.org/3/tutorial/datastructures.html' }
  ],
  'excel': [
    { title: 'Excel Help & Learning', source: 'Microsoft', url: 'https://support.microsoft.com/en-us/excel' },
    { title: 'Excel functions by category', source: 'Microsoft', url: 'https://support.microsoft.com/en-us/office/excel-functions-by-category-5f91f4e9-7b42-46d2-9bd1-63f26a86c0eb' }
  ],
  'statistics': [
    { title: 'Statistics and Probability', source: 'Khan Academy', url: 'https://www.khanacademy.org/math/statistics-probability' },
    { title: 'Seeing Theory', source: 'Brown University', url: 'https://seeing-theory.brown.edu/' }
  ],
  'data visualization': [
    { title: 'Choosing a Chart', source: 'Data-to-Viz', url: 'https://www.data-to-viz.com/' },
    { title: 'Data storytelling', source: 'Tableau', url: 'https://www.tableau.com/learn/articles/data-storytelling' }
  ],
  'tableau power bi': [
    { title: 'Get Started with Tableau', source: 'Tableau', url: 'https://help.tableau.com/current/guides/get-started-tutorial/en-us/get-started-tutorial-home.htm' },
    { title: 'Power BI Learning', source: 'Microsoft Learn', url: 'https://learn.microsoft.com/en-us/training/powerplatform/power-bi/' }
  ],
  'etl': [
    { title: 'What Is ETL?', source: 'IBM', url: 'https://www.ibm.com/think/topics/etl' },
    { title: 'Core Concepts', source: 'Apache Airflow', url: 'https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/overview.html' }
  ],
  'business intelligence': [
    { title: 'What Is Business Intelligence?', source: 'Microsoft Learn', url: 'https://learn.microsoft.com/en-us/power-bi/fundamentals/power-bi-overview' },
    { title: 'Data storytelling', source: 'Tableau', url: 'https://www.tableau.com/learn/articles/data-storytelling' }
  ],
  'machine learning': [
    { title: 'Machine Learning Crash Course', source: 'Google', url: 'https://developers.google.com/machine-learning/crash-course' },
    { title: 'Getting Started', source: 'scikit-learn', url: 'https://scikit-learn.org/stable/getting_started.html' }
  ],
  'data preprocessing': [
    { title: 'Getting Started with pandas', source: 'pandas', url: 'https://pandas.pydata.org/docs/getting_started/index.html' },
    { title: 'Preprocessing Data', source: 'scikit-learn', url: 'https://scikit-learn.org/stable/modules/preprocessing.html' }
  ],
  'scikit learn': [
    { title: 'Getting Started', source: 'scikit-learn', url: 'https://scikit-learn.org/stable/getting_started.html' },
    { title: 'Composing Estimators', source: 'scikit-learn', url: 'https://scikit-learn.org/stable/modules/compose.html' }
  ],
  'deep learning': [
    { title: 'Deep Learning Tutorials', source: 'PyTorch', url: 'https://pytorch.org/tutorials/' },
    { title: 'Deep Learning Book', source: 'Goodfellow, Bengio & Courville', url: 'https://www.deeplearningbook.org/' }
  ],
  'model evaluation': [
    { title: 'Model Evaluation', source: 'scikit-learn', url: 'https://scikit-learn.org/stable/modules/model_evaluation.html' },
    { title: 'Classification Metrics', source: 'Google ML Crash Course', url: 'https://developers.google.com/machine-learning/crash-course/classification/accuracy-precision-recall' }
  ],
  'feature engineering': [
    { title: 'Feature extraction', source: 'scikit-learn', url: 'https://scikit-learn.org/stable/modules/feature_extraction.html' },
    { title: 'Preprocessing Data', source: 'scikit-learn', url: 'https://scikit-learn.org/stable/modules/preprocessing.html' }
  ],
  'requirements gathering': [
    { title: 'Requirements Management', source: 'Atlassian', url: 'https://www.atlassian.com/agile/product-management/requirements' },
    { title: 'Business Analysis Resources', source: 'IIBA', url: 'https://www.iiba.org/business-analysis-blogs/' }
  ],
  'swot analysis': [
    { title: 'SWOT Analysis', source: 'MindTools', url: 'https://www.mindtools.com/amtbj63/swot-analysis/' },
    { title: 'SWOT analysis', source: 'Queensland Government', url: 'https://www.business.qld.gov.au/starting-business/planning/market-customer-research/swot-analysis' }
  ],
  'uml diagrams': [
    { title: 'UML Tutorial', source: 'Visual Paradigm', url: 'https://www.visual-paradigm.com/guide/uml-unified-modeling-language/what-is-uml/' },
    { title: 'UML Specification', source: 'Object Management Group', url: 'https://www.omg.org/spec/UML/' }
  ],
  'stakeholder management': [
    { title: 'Stakeholder Engagement', source: 'IIBA', url: 'https://www.iiba.org/business-analysis-blogs/' },
    { title: 'Stakeholders in project management', source: 'Atlassian', url: 'https://www.atlassian.com/agile/project-management/stakeholders' }
  ],
  'agile scrum': [
    { title: 'Scrum Guide', source: 'Scrum Guides', url: 'https://scrumguides.org/scrum-guide.html' },
    { title: 'Agile and Scrum', source: 'Atlassian', url: 'https://www.atlassian.com/agile/scrum' }
  ],
  'jira': [
    { title: 'Jira Fundamentals', source: 'Atlassian', url: 'https://www.atlassian.com/software/jira/guides' },
    { title: 'Jira Learning', source: 'Atlassian University', url: 'https://university.atlassian.com/student/catalog' }
  ],
  'business process modeling': [
    { title: 'BPMN Introduction', source: 'Camunda', url: 'https://camunda.com/bpmn/' },
    { title: 'BPMN 2.0 Specification', source: 'Object Management Group', url: 'https://www.omg.org/spec/BPMN/2.0/' }
  ],
  'reporting': [
    { title: 'Power BI Learning', source: 'Microsoft Learn', url: 'https://learn.microsoft.com/en-us/training/powerplatform/power-bi/' },
    { title: 'Data storytelling', source: 'Tableau', url: 'https://www.tableau.com/learn/articles/data-storytelling' }
  ],
  'manual testing': [
    { title: 'Software Testing Guide', source: 'Atlassian', url: 'https://www.atlassian.com/continuous-delivery/software-testing/types-of-software-testing' },
    { title: 'Testing Glossary', source: 'ISTQB', url: 'https://glossary.istqb.org/' }
  ],
  'test cases': [
    { title: 'Create test plans', source: 'Microsoft Learn', url: 'https://learn.microsoft.com/en-us/azure/devops/test/create-a-test-plan?view=azure-devops' },
    { title: 'Testing Glossary', source: 'ISTQB', url: 'https://glossary.istqb.org/' }
  ],
  'selenium': [
    { title: 'Selenium Documentation', source: 'Selenium', url: 'https://www.selenium.dev/documentation/' },
    { title: 'WebDriver Getting Started', source: 'Selenium', url: 'https://www.selenium.dev/documentation/webdriver/getting_started/' }
  ],
  'api testing': [
    { title: 'API Testing', source: 'Postman', url: 'https://learning.postman.com/docs/tests-and-scripts/write-scripts/test-scripts/' },
    { title: 'HTTP Overview', source: 'MDN', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview' }
  ],
  'bug reporting': [
    { title: 'Bug Tracking Guide', source: 'Atlassian', url: 'https://www.atlassian.com/agile/software-development/bug-tracking' },
    { title: 'Software Testing Guide', source: 'Atlassian', url: 'https://www.atlassian.com/continuous-delivery/software-testing/types-of-software-testing' }
  ],
  'agile testing': [
    { title: 'Agile Tester Certification', source: 'ISTQB', url: 'https://www.istqb.org/certifications/agile-tester' },
    { title: 'Scrum Guide', source: 'Scrum.org', url: 'https://scrumguides.org/scrum-guide.html' }
  ],
  'test planning': [
    { title: 'Test plans in Azure DevOps', source: 'Microsoft Learn', url: 'https://learn.microsoft.com/en-us/azure/devops/test/create-a-test-plan?view=azure-devops' },
    { title: 'Testing Glossary', source: 'ISTQB', url: 'https://glossary.istqb.org/' }
  ],
  'figma': [
    { title: 'Figma Learn', source: 'Figma', url: 'https://help.figma.com/hc/en-us/categories/360002051613-Get-started' },
    { title: 'Design Basics', source: 'Figma', url: 'https://www.figma.com/resource-library/design-basics/' }
  ],
  'design principles': [
    { title: 'Laws of UX', source: 'Laws of UX', url: 'https://lawsofux.com/' },
    { title: 'Design Principles', source: 'Nielsen Norman Group', url: 'https://www.nngroup.com/articles/ten-usability-heuristics/' }
  ],
  'user research': [
    { title: 'User Research Methods', source: 'Nielsen Norman Group', url: 'https://www.nngroup.com/articles/which-ux-research-methods/' },
    { title: 'User interviews', source: 'Nielsen Norman Group', url: 'https://www.nngroup.com/articles/user-interviews/' }
  ],
  'wireframing': [
    { title: 'Wireframing Guide', source: 'Figma', url: 'https://www.figma.com/resource-library/what-is-wireframing/' },
    { title: 'Wireframing', source: 'Interaction Design Foundation', url: 'https://www.interaction-design.org/literature/topics/wireframing' }
  ],
  'prototyping': [
    { title: 'Create Prototypes', source: 'Figma', url: 'https://help.figma.com/hc/en-us/articles/360040314193-Create-prototype-connections' },
    { title: 'Prototype design', source: 'Figma', url: 'https://www.figma.com/resource-library/what-is-prototyping/' }
  ],
  'usability testing': [
    { title: 'Usability Testing 101', source: 'Nielsen Norman Group', url: 'https://www.nngroup.com/articles/usability-testing-101/' },
    { title: 'How Many Test Users?', source: 'Nielsen Norman Group', url: 'https://www.nngroup.com/articles/why-you-only-need-to-test-with-5-users/' }
  ],
  'color theory': [
    { title: 'Color Wheel', source: 'Adobe Color', url: 'https://color.adobe.com/create/color-wheel' },
    { title: 'Contrast Checker', source: 'WebAIM', url: 'https://webaim.org/resources/contrastchecker/' }
  ],
  'accessibility': [
    { title: 'WCAG Standards', source: 'W3C', url: 'https://www.w3.org/WAI/standards-guidelines/wcag/' },
    { title: 'Web Accessibility', source: 'MDN', url: 'https://developer.mozilla.org/en-US/docs/Web/Accessibility' }
  ]
};

const additionalStudyResources = {
  oop: [{ title: 'Classes and objects', source: 'Oracle', url: 'https://docs.oracle.com/javase/tutorial/java/javaOO/index.html' }],
  'spring boot': [{ title: 'Build a REST service', source: 'Spring', url: 'https://spring.io/guides/gs/rest-service/' }],
  java: [{ title: 'Java Language Basics', source: 'dev.java', url: 'https://dev.java/learn/language-basics/' }],
  'html css': [{ title: 'Learn CSS', source: 'web.dev', url: 'https://web.dev/learn/css/' }],
  javascript: [{ title: 'Learn JavaScript', source: 'web.dev', url: 'https://web.dev/learn/javascript/' }],
  react: [{ title: 'React API Reference', source: 'React', url: 'https://react.dev/reference/react' }],
  sql: [{ title: 'MySQL Tutorial', source: 'MySQL', url: 'https://dev.mysql.com/doc/refman/8.4/en/tutorial.html' }],
  'rest api': [{ title: 'HTTP request methods', source: 'MDN', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods' }],
  python: [{ title: 'Python Beginner’s Guide', source: 'Python.org', url: 'https://wiki.python.org/moin/BeginnersGuide/NonProgrammers' }],
  excel: [{ title: 'XLOOKUP function', source: 'Microsoft', url: 'https://support.microsoft.com/en-us/office/xlookup-function-b7fd680e-6d10-43e6-84f9-88eae8bf5929' }],
  statistics: [{ title: 'Introductory Statistics', source: 'OpenStax', url: 'https://openstax.org/details/books/introductory-statistics-2e' }],
  'data visualization': [{ title: 'Data visualization', source: 'Tableau', url: 'https://www.tableau.com/learn/articles/data-visualization' }],
  'tableau power bi': [{ title: 'Create Power BI dashboards', source: 'Microsoft Learn', url: 'https://learn.microsoft.com/en-us/power-bi/create-reports/service-dashboards' }],
  etl: [{ title: 'Extract, transform, and load', source: 'Microsoft Learn', url: 'https://learn.microsoft.com/en-us/azure/architecture/data-guide/relational-data/etl' }],
  'business intelligence': [{ title: 'What is business intelligence?', source: 'IBM', url: 'https://www.ibm.com/think/topics/business-intelligence' }],
  'machine learning': [{ title: 'Introduction to machine learning', source: 'Google', url: 'https://developers.google.com/machine-learning/intro-to-ml' }],
  'data preprocessing': [{ title: 'Imputation of missing values', source: 'scikit-learn', url: 'https://scikit-learn.org/stable/modules/impute.html' }],
  'scikit learn': [{ title: 'scikit-learn User Guide', source: 'scikit-learn', url: 'https://scikit-learn.org/stable/user_guide.html' }],
  'deep learning': [{ title: 'TensorFlow Tutorials', source: 'TensorFlow', url: 'https://www.tensorflow.org/tutorials' }],
  'model evaluation': [{ title: 'Cross-validation', source: 'scikit-learn', url: 'https://scikit-learn.org/stable/modules/cross_validation.html' }],
  'feature engineering': [{ title: 'Feature selection', source: 'scikit-learn', url: 'https://scikit-learn.org/stable/modules/feature_selection.html' }],
  'requirements gathering': [{ title: 'Requirements elicitation', source: 'BCS', url: 'https://www.bcs.org/articles-opinion-and-research/what-is-requirements-elicitation/' }],
  'swot analysis': [{ title: 'SWOT analysis', source: 'Corporate Finance Institute', url: 'https://corporatefinanceinstitute.com/resources/management/swot-analysis/' }],
  'uml diagrams': [{ title: 'UML diagrams', source: 'UML Diagrams', url: 'https://www.uml-diagrams.org/' }],
  'stakeholder management': [{ title: 'Business Analysis Core Concept Model', source: 'IIBA', url: 'https://www.iiba.org/knowledgehub/business-analysis-core-concept-model/' }],
  'agile scrum': [{ title: 'Agile Manifesto', source: 'Agile Alliance', url: 'https://agilemanifesto.org/' }],
  jira: [{ title: 'Jira Cloud documentation', source: 'Atlassian Support', url: 'https://support.atlassian.com/jira-software-cloud/' }],
  'business process modeling': [{ title: 'BPMN model walkthrough', source: 'bpmn.io', url: 'https://bpmn.io/toolkit/bpmn-js/walkthrough/' }],
  reporting: [{ title: 'Data visualization', source: 'Tableau', url: 'https://www.tableau.com/learn/articles/data-visualization' }],
  'manual testing': [{ title: 'Foundation Level certification', source: 'ISTQB', url: 'https://www.istqb.org/certifications/certified-tester-foundation-level' }],
  'test cases': [{ title: 'Foundation Level certification', source: 'ISTQB', url: 'https://www.istqb.org/certifications/certified-tester-foundation-level' }],
  selenium: [{ title: 'Test Practices', source: 'Selenium', url: 'https://www.selenium.dev/documentation/test_practices/' }],
  'api testing': [{ title: 'API testing', source: 'Postman', url: 'https://www.postman.com/api-platform/api-testing/' }],
  'bug reporting': [{ title: 'Project issues', source: 'GitLab Docs', url: 'https://docs.gitlab.com/user/project/issues/' }],
  'agile testing': [{ title: 'Agile Manifesto', source: 'Agile Alliance', url: 'https://agilemanifesto.org/' }],
  'test planning': [{ title: 'Foundation Level certification', source: 'ISTQB', url: 'https://www.istqb.org/certifications/certified-tester-foundation-level' }],
  figma: [{ title: 'Create prototype connections', source: 'Figma', url: 'https://help.figma.com/hc/en-us/articles/360040314193-Create-prototype-connections' }],
  'design principles': [{ title: 'Accessible design', source: 'Material Design', url: 'https://m3.material.io/foundations/accessible-design/overview' }],
  'user research': [{ title: 'Field studies', source: 'Nielsen Norman Group', url: 'https://www.nngroup.com/articles/field-studies/' }],
  wireframing: [{ title: 'What is a wireframe?', source: 'UXPin', url: 'https://www.uxpin.com/studio/blog/what-is-a-wireframe/' }],
  prototyping: [{ title: 'Prototype design', source: 'Nielsen Norman Group', url: 'https://www.nngroup.com/articles/ux-prototype-hi-lo-fidelity/' }],
  'usability testing': [{ title: 'Evaluation methods', source: 'W3C', url: 'https://www.w3.org/WAI/test-evaluate/' }],
  'color theory': [{ title: 'Understanding contrast minimum', source: 'W3C', url: 'https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html' }],
  accessibility: [{ title: 'WAI Tutorials', source: 'W3C', url: 'https://www.w3.org/WAI/tutorials/' }]
};

export function getLearningLevel(topicName) {
  return levels[topicName] || 'Beginner';
}

export function getStudyResources(topicName, existingResources = []) {
  const catalogKey = normalize(topicName);
  const catalogResources = studyResources[catalogKey] || [];
  const supplementalResources = additionalStudyResources[catalogKey] || [];
  const fallbackResources = existingResources.filter((resource) => {
    try { return new URL(resource.url).hostname !== 'www.google.com'; } catch { return false; }
  });
  const resources = (catalogResources.length ? [...catalogResources, ...supplementalResources] : fallbackResources)
    .filter((resource, index, all) => all.findIndex((candidate) => candidate.url === resource.url) === index)
    .slice(0, 4);

  return resources.map((resource, index) => {
    let source = resource.source;
    try { source = source || new URL(resource.url).hostname.replace(/^www\./, ''); } catch { source = source || 'Learning resource'; }
    return {
      ...resource,
      source,
      type: resource.type || (index === 0 ? 'Learning guide' : 'Reference'),
      difficulty: getLearningLevel(topicName),
      minutes: resource.minutes || (index === 0 ? 12 : 8)
    };
  });
}

export function findLearningExercise(topic, careerId) {
  if (!topic || !careerId) return null;
  const normalizedTopic = normalize(topic.name);
  const acceptedSkills = new Set([
    normalizedTopic,
    ...(aliases[normalizedTopic] || []).map(normalize)
  ]);
  const question = questions.find((item) => item.career === careerId && acceptedSkills.has(normalize(item.skill)));
  return question ? {
    id: question.id,
    prompt: question.question,
    options: question.options,
    correctIndex: question.correct,
    explanation: `Review ${topic.name} fundamentals and the related concept: ${question.skill}.`
  } : null;
}

export function getTopicExample(topicName) {
  const normalized = normalize(topicName);
  if (normalized.includes('python')) return { language: 'python', code: 'scores = [72, 88, 91]\naverage = sum(scores) / len(scores)' };
  if (normalized === 'java') return { language: 'java', code: 'List<String> names = List.of("Ari", "Sam");\nSystem.out.println(names.size());' };
  if (normalized.includes('sql')) return { language: 'sql', code: 'SELECT department, COUNT(*)\nFROM employees\nGROUP BY department;' };
  if (normalized.includes('excel')) return { language: 'excel', code: '=AVERAGE(B2:B10)' };
  if (normalized.includes('react')) return { language: 'jsx', code: 'const [isOpen, setIsOpen] = useState(false);' };
  if (normalized.includes('javascript')) return { language: 'javascript', code: 'const activeUsers = users.filter(user => user.active);' };
  if (normalized.includes('html') || normalized.includes('accessibility')) return { language: 'html', code: '<button type="button">Save changes</button>' };
  if (normalized.includes('statistics')) return { language: 'formula', code: 'mean = sum(values) / count(values)' };
  if (normalized.includes('etl')) return { language: 'workflow', code: 'extract  ->  validate and transform  ->  load' };
  if (normalized.includes('figma') || normalized.includes('prototype')) return { language: 'design flow', code: 'User goal  ->  screen flow  ->  clickable prototype  ->  usability check' };
  return { language: topicName, code: `Start with one clear goal.\nBreak ${topicName} into a small, testable step.` };
}

export function getTopicOverview(topicName, description = '') {
  const normalized = normalize(topicName);
  const overview = [
    { match: 'python', text: 'Python lets you express ideas with readable code. Start with values and collections, then use small functions to transform data.' },
    { match: 'java', text: 'Java is a typed, object-oriented language. Learn how values, classes, and collections fit together before building larger programs.' },
    { match: 'sql', text: 'SQL is how you ask relational databases precise questions. Begin by selecting rows and columns, then combine and summarize data.' },
    { match: 'react', text: 'React builds interfaces from components. Props describe inputs, state captures changing information, and events connect the two.' },
    { match: 'javascript', text: 'JavaScript makes web pages respond to people. Small functions and array operations are a good foundation for interactive features.' },
    { match: 'excel', text: 'Excel turns rows of information into calculations and summaries. Formulas, references, and tables help make analysis repeatable.' },
    { match: 'statistics', text: 'Statistics helps describe data and judge whether patterns are meaningful. Start with summaries, then consider variation and uncertainty.' },
    { match: 'machine learning', text: 'Machine learning uses examples to learn patterns. Separate training from evaluation so you can tell whether a model generalizes.' },
    { match: 'etl', text: 'ETL moves data from its source into a useful destination. Each step should be repeatable and checked for quality.' },
    { match: 'accessibility', text: 'Accessibility makes digital experiences usable by people with different abilities and ways of interacting. Structure, contrast, and keyboard support all matter.' },
    { match: 'testing', text: 'Testing checks whether a product behaves as people expect. Clear scenarios and observable results make defects easier to reproduce.' },
    { match: 'figma', text: 'Figma helps teams explore interface ideas together. Organize screens into flows, then use a prototype to make decisions tangible.' },
    { match: 'wireframing', text: 'Wireframes communicate structure before visual polish. They help teams discuss hierarchy and tasks while changes are still inexpensive.' },
    { match: 'user research', text: 'User research replaces assumptions with evidence about people, their needs, and their context. A focused question makes each study more useful.' },
    { match: 'agile', text: 'Agile organizes work into small feedback loops. The goal is to learn early, adapt priorities, and keep outcomes visible.' },
    { match: 'requirements', text: 'Requirements make a problem and its desired outcome clear to everyone involved. Good discovery connects user needs to verifiable results.' },
    { match: 'data visualization', text: 'Data visualization uses visual comparisons to help people notice patterns. Choose a chart based on the question, not decoration.' },
    { match: 'business intelligence', text: 'Business intelligence connects trusted data with decisions. Clear metric definitions matter as much as the dashboard itself.' },
    { match: 'spring boot', text: 'Spring Boot helps Java teams create production-ready services with sensible defaults. Learn how application components collaborate.' },
    { match: 'rest api', text: 'A REST API gives clients a consistent way to work with resources over HTTP. Resource names, methods, and status codes communicate intent.' },
    { match: 'oop', text: 'Object-oriented programming organizes behavior and state into collaborating types. Encapsulation keeps each type responsible for its own rules.' },
    { match: 'data preprocessing', text: 'Preprocessing makes raw data suitable for analysis or modeling. Fit transformations on training data to avoid leaking information.' },
    { match: 'scikit', text: 'Scikit-learn provides consistent tools for fitting, evaluating, and composing machine-learning workflows in Python.' },
    { match: 'deep learning', text: 'Deep learning uses layered neural networks to learn representations from data. Start with the role of layers, loss, and evaluation.' },
    { match: 'feature engineering', text: 'Feature engineering turns raw fields into useful model inputs. Every transformation should be justified by the problem and checked for leakage.' },
    { match: 'business process', text: 'Business process modeling makes work, handoffs, and decisions visible. A clear current-state map helps teams target practical improvements.' },
    { match: 'reporting', text: 'Useful reporting connects a question to a small number of trustworthy measures and makes the next decision easier.' },
    { match: 'jira', text: 'Jira helps teams track work and make its status visible. Well-scoped issues describe an outcome, priority, and acceptance criteria.' },
    { match: 'selenium', text: 'Selenium automates browser interactions to check real user flows. Stable selectors and clear assertions make tests dependable.' },
    { match: 'bug reporting', text: 'A strong bug report lets another person reproduce the problem quickly. Record the expected behavior, actual result, and useful context.' },
    { match: 'test cases', text: 'A test case turns a requirement into specific steps and an expected result. Include normal, boundary, and invalid inputs.' },
    { match: 'color theory', text: 'Color choices create hierarchy and meaning, but must also remain legible. Check contrast in the actual context where color appears.' },
    { match: 'prototyp', text: 'A prototype lets people try a design before it is built. Match its fidelity to the question you need to answer.' },
    { match: 'usability', text: 'Usability testing observes people attempting realistic tasks. Their behavior reveals friction that a design review may miss.' },
    { match: 'stakeholder', text: 'Stakeholder management aligns people around needs, trade-offs, and decisions. Shared evidence helps keep discussions productive.' },
    { match: 'uml', text: 'UML diagrams give teams a shared visual language for systems and interactions. Choose the diagram that answers the current design question.' },
    { match: 'swot', text: 'SWOT separates internal strengths and weaknesses from external opportunities and threats to support a grounded discussion.' },
    { match: 'tableau', text: 'BI tools connect data to interactive views. Start with a well-defined question, then make filters and measures easy to interpret.' },
    { match: 'model evaluation', text: 'Model evaluation measures performance on data the model did not learn from. Select metrics that match the real cost of each outcome.' },
    { match: 'design principles', text: 'Design principles help interfaces communicate hierarchy, consistency, and feedback. Apply them in service of a user task.' }
  ];
  return overview.find((item) => normalized.includes(item.match))?.text
    || `${description || `${topicName} is an important part of your career path.`} Build understanding in small steps, check your thinking, and apply it to a realistic example.`;
}

export function getConceptDetails(topicName, conceptText) {
  const topic = normalize(topicName);
  const concept = normalize(conceptText);
  const details = [
    { match: ['sql', 'select where'], text: 'Choose only the columns you need, then filter rows to match the question.', example: 'SELECT name FROM learners WHERE active = true;' },
    { match: ['sql', 'join'], text: 'A join combines related rows from tables using a shared key.', example: 'employees.department_id = departments.id' },
    { match: ['sql', 'group by'], text: 'Group rows by a category before calculating a count, total, or average.', example: 'GROUP BY department' },
    { match: ['python', 'list dict'], text: 'Lists keep an ordered collection; dictionaries look up values by a meaningful key.', example: 'scores = {"Ari": 92}' },
    { match: ['python', 'function'], text: 'A function names a reusable action and can return a result to its caller.', example: 'def double(value):\n    return value * 2' },
    { match: ['react', 'state'], text: 'State stores information that can change and cause the component to render again.', example: 'const [open, setOpen] = useState(false);' },
    { match: ['react', 'component'], text: 'A component is a reusable piece of interface described with a function and markup.', example: 'function Welcome({ name }) { return <h1>Hi {name}</h1>; }' },
    { match: ['java', 'collection'], text: 'Collections hold groups of values; choose a list for order or a set for uniqueness.', example: 'List<String> names = new ArrayList<>();' },
    { match: ['java', 'exception'], text: 'Exception handling lets a program respond deliberately when an operation cannot complete.', example: 'try { readFile(); } catch (IOException error) { ... }' },
    { match: ['statistics', 'mean median'], text: 'The mean uses every value; the median is the middle after sorting and resists extreme values.', example: 'For 2, 3, 100: mean = 35; median = 3' },
    { match: ['etl', 'extract transform load'], text: 'Extract gathers source data, transform checks or reshapes it, and load stores the result for use.', example: 'Source CSV → validate dates → reporting table' },
    { match: ['machine learning', 'train test'], text: 'Keep a test set separate so the final evaluation uses examples the model did not train on.', example: 'Train: learn patterns · Test: estimate generalization' },
    { match: ['accessibility', 'keyboard'], text: 'Every interactive control should be reachable and usable with a keyboard alone.', example: 'Tab to focus · Enter or Space to activate' },
    { match: ['test cases', 'boundary'], text: 'Boundary tests cover values at and just beyond the allowed limits.', example: 'For 1–10: test 0, 1, 10, and 11' },
    { match: ['data visualization', 'chart'], text: 'Use position and length for accurate comparisons; reserve color for categories or emphasis.', example: 'Compare groups → bar chart · Change over time → line chart' },
    { match: ['requirements', 'acceptance'], text: 'Acceptance criteria describe observable conditions that show the requested outcome is met.', example: 'Given a saved draft, when reopened, then its text is restored.' },
    { match: ['rest api', 'http'], text: 'HTTP methods communicate the action while status codes summarize the outcome.', example: 'GET /tasks → 200 · POST /tasks → 201' },
    { match: ['oop', 'encapsulation'], text: 'Encapsulation keeps an object’s state behind a small set of operations that protect its rules.', example: 'account.deposit(amount) validates before updating balance' }
  ];
  return details.find((item) => item.match.every((key) => topic.includes(key) || concept.includes(key)))
    || {
      text: `${conceptText} is a practical building block of ${topicName}. Identify what it helps you do, then test it in a small example.`,
      example: getTopicExample(topicName).code
    };
}

export function getVideoId(url) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('youtu.be')) return parsed.pathname.slice(1).split('/')[0] || null;
    if (!parsed.hostname.includes('youtube.com')) return null;
    if (parsed.searchParams.has('v')) return parsed.searchParams.get('v');
    const match = parsed.pathname.match(/\/(?:embed|shorts)\/([^/?]+)/);
    return match?.[1] || null;
  } catch {
    return null;
  }
}

export function getVideoThumbnail(url, quality = 'mqdefault') {
  const videoId = getVideoId(url);
  return videoId && !unavailableThumbnails.has(videoId)
    ? `https://img.youtube.com/vi/${videoId}/${quality}.jpg`
    : null;
}

export function getAssessmentTopicMatch(topicName, skillName) {
  const topic = normalize(topicName);
  const skill = normalize(skillName);
  if (!topic || !skill) return false;
  if (topic === skill || topic.includes(skill) || skill.includes(topic)) return true;
  return (aliases[topic] || []).some((alias) => normalize(alias) === skill);
}