function ytCourse(topic) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(`${topic} beginner full course`)}`;
}

function roadmap({ videos, reading, concepts, tasks, project }) {
  return {
    youtube: videos.map((v, i) => ({ id: `yt${i + 1}`, ...v })),
    reading: reading.map((r, i) => ({ id: `rd${i + 1}`, ...r })),
    concepts: concepts.map((text, i) => ({ id: `c${i + 1}`, text })),
    tasks: tasks.map((text, i) => ({ id: `tk${i + 1}`, text })),
    project
  };
}

export function getRoadmapItems(roadmapData) {
  return [
    ...roadmapData.youtube.map((v) => ({ id: v.id, section: 'video' })),
    ...roadmapData.reading.map((r) => ({ id: r.id, section: 'reading' })),
    ...roadmapData.concepts.map((c) => ({ id: c.id, section: 'concept' })),
    ...roadmapData.tasks.map((t) => ({ id: t.id, section: 'task' })),
    { id: 'project', section: 'project' }
  ];
}

export function topicProgressStats(topicName, topicProgress = {}) {
  const roadmapData = getRoadmap(topicName);
  const items = getRoadmapItems(roadmapData);
  const done = items.filter((item) => topicProgress[item.id]).length;
  const total = items.length;
  return {
    done,
    total,
    percent: total ? Math.round((done / total) * 100) : 0,
    complete: total > 0 && done === total
  };
}

export const roadmaps = {
  'java': roadmap({
    videos: [
      { title: 'Java Full Course for Beginners (freeCodeCamp)', url: 'https://www.youtube.com/watch?v=xk4_1vDrzzo' },
      { title: 'Java Tutorial for Beginners (Programming with Mosh)', url: 'https://www.youtube.com/watch?v=eIrMbAQSU34' }
    ],
    reading: [
      { title: 'Oracle Java Tutorials', url: 'https://docs.oracle.com/javase/tutorial/' },
      { title: 'Java Language Basics', url: 'https://dev.java/learn/' }
    ],
    concepts: ['JVM vs JDK vs JRE', 'Primitive types and strings', 'Control flow and methods', 'Collections (List, Set, Map)', 'Exceptions and try/catch'],
    tasks: ['Install JDK and run a Hello World class', 'Build a CLI calculator', 'Write a program that uses ArrayList and HashMap'],
    project: { title: 'Student Grade Tracker', description: 'Create a Java console app that stores student names and scores, computes averages, and prints the top scorer.' }
  }),
  'oop': roadmap({
    videos: [
      { title: 'Object Oriented Programming in Java', url: 'https://www.youtube.com/watch?v=SiBw7os-_zI' },
      { title: 'OOP Explained for Beginners', url: 'https://www.youtube.com/watch?v=pTB0EiLXUC8' }
    ],
    reading: [
      { title: 'OOP Concepts (Oracle)', url: 'https://docs.oracle.com/javase/tutorial/java/concepts/' },
      { title: 'SOLID design principles', url: 'https://www.digitalocean.com/community/conceptual-articles/s-o-l-i-d-the-first-five-principles-of-object-oriented-design' }
    ],
    concepts: ['Encapsulation', 'Inheritance', 'Polymorphism', 'Abstraction', 'Interfaces vs abstract classes'],
    tasks: ['Model a BankAccount class with private balance', 'Override toString in a subclass', 'Use an interface for payment methods'],
    project: { title: 'Library Catalog', description: 'Design Book, Member, and Loan classes with inheritance and encapsulation. Support borrow and return operations.' }
  }),
  'html-css': roadmap({
    videos: [
      { title: 'HTML & CSS Full Course (freeCodeCamp)', url: 'https://www.youtube.com/watch?v=G3e-cpL7ofc' },
      { title: 'CSS Flexbox in 20 minutes', url: 'https://www.youtube.com/watch?v=JJSoEo8JSnc' }
    ],
    reading: [
      { title: 'MDN HTML basics', url: 'https://developer.mozilla.org/en-US/docs/Learn/HTML' },
      { title: 'MDN CSS layout', url: 'https://developer.mozilla.org/en-US/docs/Learn/CSS' }
    ],
    concepts: ['Semantic HTML', 'Box model', 'Flexbox', 'Grid', 'Responsive media queries'],
    tasks: ['Recreate a simple landing page', 'Build a responsive two-column layout', 'Style a form with accessible labels'],
    project: { title: 'Personal Portfolio Page', description: 'Build a one-page portfolio with header, projects grid, and contact form using only HTML and CSS.' }
  }),
  'javascript': roadmap({
    videos: [
      { title: 'JavaScript Full Course (freeCodeCamp)', url: 'https://www.youtube.com/watch?v=PkZNo7MFNFg' },
      { title: 'JavaScript Crash Course', url: 'https://www.youtube.com/watch?v=hdI2bqOjy3c' }
    ],
    reading: [
      { title: 'MDN JavaScript Guide', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide' },
      { title: 'JavaScript.info', url: 'https://javascript.info/' }
    ],
    concepts: ['let/const and scope', 'Functions and arrays', 'DOM events', 'Promises and async/await', 'ES modules'],
    tasks: ['Write array transform functions', 'Build a counter with the DOM', 'Fetch JSON from a public API'],
    project: { title: 'Expense Tracker', description: 'Create a browser app that adds expenses, totals them, and saves data in localStorage.' }
  }),
  'react': roadmap({
    videos: [
      { title: 'React Course for Beginners (freeCodeCamp)', url: 'https://www.youtube.com/watch?v=bMknfKXIFA8' },
      { title: 'React Hooks Tutorial', url: 'https://www.youtube.com/watch?v=TNhaISOUy6Q' }
    ],
    reading: [
      { title: 'Official React docs', url: 'https://react.dev/learn' },
      { title: 'Thinking in React', url: 'https://react.dev/learn/thinking-in-react' }
    ],
    concepts: ['Components and JSX', 'props vs state', 'useState and useEffect', 'Lists and keys', 'Lifting state up'],
    tasks: ['Build a todo list with hooks', 'Fetch and display a list of posts', 'Split UI into reusable components'],
    project: { title: 'Job Tracker Board', description: 'Build a React board with columns for Applied / Interview / Offer. Persist jobs in localStorage.' }
  }),
  'spring-boot': roadmap({
    videos: [
      { title: 'Spring Boot for Beginners', url: 'https://www.youtube.com/watch?v=9SGDpanrcEg' },
      { title: 'REST API with Spring Boot', url: 'https://www.youtube.com/watch?v=5eMo-AOcX9c' }
    ],
    reading: [
      { title: 'Spring Boot reference', url: 'https://docs.spring.io/spring-boot/docs/current/reference/html/' },
      { title: 'Building a REST service', url: 'https://spring.io/guides/gs/rest-service/' }
    ],
    concepts: ['Dependency injection', '@RestController', 'Spring Data JPA', 'application.properties', 'Request mapping and status codes'],
    tasks: ['Create a starter Spring Boot app', 'Expose GET and POST endpoints', 'Connect an in-memory H2 entity'],
    project: { title: 'Notes REST API', description: 'Build CRUD endpoints for notes with validation and JSON responses.' }
  }),
  'sql': roadmap({
    videos: [
      { title: 'SQL Full Course (freeCodeCamp)', url: 'https://www.youtube.com/watch?v=HXV3zeQKqGY' },
      { title: 'SQL Joins Explained', url: 'https://www.youtube.com/watch?v=9yeOJ0ZMUYw' }
    ],
    reading: [
      { title: 'W3Schools SQL tutorial', url: 'https://www.w3schools.com/sql/' },
      { title: 'PostgreSQL tutorial', url: 'https://www.postgresql.org/docs/current/tutorial.html' }
    ],
    concepts: ['SELECT / WHERE', 'JOINs', 'GROUP BY and aggregates', 'Primary and foreign keys', 'Indexes'],
    tasks: ['Write queries on a sample employees table', 'Practice INNER vs LEFT JOIN', 'Create a schema with two related tables'],
    project: { title: 'Movie Rentals Database', description: 'Design tables for movies, customers, and rentals, then write queries for overdue titles and top customers.' }
  }),
  'rest-api': roadmap({
    videos: [
      { title: 'REST API Crash Course', url: 'https://www.youtube.com/watch?v=Q-BpqyOT3a8' },
      { title: 'HTTP Crash Course', url: 'https://www.youtube.com/watch?v=iYM2zFP3Zn0' }
    ],
    reading: [
      { title: 'MDN HTTP overview', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP' },
      { title: 'REST API design best practices', url: 'https://stackoverflow.blog/2020/03/02/best-practices-for-rest-api-design/' }
    ],
    concepts: ['HTTP methods', 'Status codes', 'JSON request/response', 'Authentication basics', 'Idempotency'],
    tasks: ['Call a public API with fetch/Postman', 'Design resource URLs for a blog', 'Document 4 endpoints with example payloads'],
    project: { title: 'Task API Spec + Client', description: 'Define a REST contract for tasks and implement a small client that lists and creates tasks.' }
  }),
  'python': roadmap({
    videos: [
      { title: 'Python for Beginners (Programming with Mosh)', url: 'https://www.youtube.com/watch?v=_uQrJ0TkZlc' },
      { title: 'Python Full Course (freeCodeCamp)', url: 'https://www.youtube.com/watch?v=rfscVS0vtbw' }
    ],
    reading: [
      { title: 'Official Python tutorial', url: 'https://docs.python.org/3/tutorial/' },
      { title: 'Python data structures', url: 'https://docs.python.org/3/tutorial/datastructures.html' }
    ],
    concepts: ['Syntax and types', 'Lists/dicts', 'Functions', 'Files', 'Virtual environments'],
    tasks: ['Write a CSV reader', 'Practice list comprehensions', 'Build a CLI quiz'],
    project: { title: 'CSV Insights Script', description: 'Read a CSV, compute summary stats, and print the top 5 rows by a numeric column.' }
  }),
  'excel': roadmap({
    videos: [
      { title: 'Excel Beginner Tutorial', url: 'https://www.youtube.com/watch?v=Vl0H-qTclOg' },
      { title: 'PivotTables for Beginners', url: 'https://www.youtube.com/watch?v=9NUjHBNWe9M' }
    ],
    reading: [
      { title: 'Microsoft Excel help', url: 'https://support.microsoft.com/en-us/excel' },
      { title: 'Excel formulas overview', url: 'https://support.microsoft.com/en-us/office/overview-of-formulas-in-excel-ecfdc708-4792-4443-9b4a-d8c9666b0236' }
    ],
    concepts: ['Cell references', 'IF / VLOOKUP / XLOOKUP', 'PivotTables', 'Charts', 'Data validation'],
    tasks: ['Clean a messy sales sheet', 'Build a PivotTable by region', 'Create a dashboard chart'],
    project: { title: 'Monthly Sales Dashboard', description: 'Use formulas and a PivotTable to summarize sales by product and month, then chart the trend.' }
  }),
  'statistics': roadmap({
    videos: [
      { title: 'Statistics for Beginners (freeCodeCamp)', url: 'https://www.youtube.com/watch?v=xxpc-HPKN28' },
      { title: 'Hypothesis Testing Explained', url: 'https://www.youtube.com/watch?v=0zZYBALbZgg' }
    ],
    reading: [
      { title: 'Khan Academy statistics', url: 'https://www.khanacademy.org/math/statistics-probability' },
      { title: 'Seeing Theory', url: 'https://seeing-theory.brown.edu/' }
    ],
    concepts: ['Mean/median/mode', 'Variance and standard deviation', 'Distributions', 'Correlation vs causation', 'p-values'],
    tasks: ['Compute descriptive stats on a dataset', 'Interpret a simple A/B test result', 'Identify outliers'],
    project: { title: 'Survey Summary Report', description: 'Analyze a small survey dataset and write findings on central tendency, spread, and one hypothesis test.' }
  }),
  'data-visualization': roadmap({
    videos: [
      { title: 'Data Visualization with Python', url: 'https://www.youtube.com/watch?v=UO98lJQ3QGI' },
      { title: 'Choosing the Right Chart', url: 'https://www.youtube.com/watch?v=C07k0euBpr8' }
    ],
    reading: [
      { title: 'from Data to Viz', url: 'https://www.data-to-viz.com/' },
      { title: 'Matplotlib quick start', url: 'https://matplotlib.org/stable/users/explain/quick_start.html' }
    ],
    concepts: ['Chart types', 'Encoding data with color/size', 'Avoiding misleading axes', 'Dashboards', 'Storytelling'],
    tasks: ['Plot a time series', 'Build a bar ranking chart', 'Redesign a cluttered chart'],
    project: { title: 'City Metrics Visual Brief', description: 'Create 3 charts from a public dataset that answer a clear question for a non-technical reader.' }
  }),
  'tableau-power-bi': roadmap({
    videos: [
      { title: 'Tableau for Beginners', url: 'https://www.youtube.com/watch?v=K3pXnbNL9W0' },
      { title: 'Power BI Full Course (freeCodeCamp)', url: 'https://www.youtube.com/watch?v=3u7MQz1Ey_8' }
    ],
    reading: [
      { title: 'Tableau getting started', url: 'https://help.tableau.com/current/guides/get-started-tutorial/en-us/get-started-tutorial-home.htm' },
      { title: 'Power BI documentation', url: 'https://learn.microsoft.com/en-us/power-bi/' }
    ],
    concepts: ['Connecting data sources', 'Measures vs dimensions', 'Filters and slicers', 'DAX basics', 'Publishing a report'],
    tasks: ['Load a CSV into Tableau or Power BI', 'Create a KPI card and a trend chart', 'Add an interactive filter'],
    project: { title: 'Retail Performance Report', description: 'Build an interactive report with revenue, orders, and region breakdown using Tableau or Power BI.' }
  }),
  'etl': roadmap({
    videos: [
      { title: 'ETL Explained for Beginners', url: 'https://www.youtube.com/watch?v=sEW5eVbbcmA' },
      { title: 'Data Pipelines Overview', url: 'https://www.youtube.com/watch?v=z-WTlcL1Er4' }
    ],
    reading: [
      { title: 'What is ETL? (IBM)', url: 'https://www.ibm.com/topics/etl' },
      { title: 'Airflow concepts', url: 'https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/overview.html' }
    ],
    concepts: ['Extract', 'Transform', 'Load', 'Data quality checks', 'Scheduling'],
    tasks: ['Extract a CSV and filter rows in Python', 'Standardize date formats', 'Load cleaned data into SQLite'],
    project: { title: 'Daily Sales Pipeline', description: 'Write a script that extracts raw sales files, cleans them, and loads a fact table with a run log.' }
  }),
  'business-intelligence': roadmap({
    videos: [
      { title: 'Business Intelligence Explained', url: 'https://www.youtube.com/watch?v=nKJtZau2n-I' },
      { title: 'KPI Dashboard Design (beginner courses)', url: ytCourse('KPI dashboard design') }
    ],
    reading: [
      { title: 'What is BI? (Microsoft)', url: 'https://learn.microsoft.com/en-us/power-bi/fundamentals/power-bi-overview' },
      { title: 'KPI guide', url: 'https://www.tableau.com/learn/articles/kpi' }
    ],
    concepts: ['KPIs', 'Dimensional modeling', 'Self-serve reporting', 'Data governance', 'Decision support'],
    tasks: ['Define 5 KPIs for an e-commerce team', 'Map sources for each KPI', 'Sketch a BI dashboard wireframe'],
    project: { title: 'Ops KPI Pack', description: 'Deliver a one-page BI brief: metrics, data sources, refresh cadence, and a dashboard mock.' }
  }),
  'machine-learning': roadmap({
    videos: [
      { title: 'Machine Learning for Everybody', url: 'https://www.youtube.com/watch?v=i_LwzRVP7bg' },
      { title: 'Supervised vs Unsupervised', url: 'https://www.youtube.com/watch?v=1FZ0A1QCMWc' }
    ],
    reading: [
      { title: 'Google ML crash course', url: 'https://developers.google.com/machine-learning/crash-course' },
      { title: 'scikit-learn user guide', url: 'https://scikit-learn.org/stable/user_guide.html' }
    ],
    concepts: ['Supervised vs unsupervised', 'Train/test split', 'Overfitting', 'Classification vs regression', 'Model selection'],
    tasks: ['Train a baseline classifier', 'Compare two algorithms on the same data', 'Plot a learning-related metric'],
    project: { title: 'Churn Baseline Model', description: 'Train a simple classifier on a tabular dataset, report accuracy/F1, and note limitations.' }
  }),
  'data-preprocessing': roadmap({
    videos: [
      { title: 'Data Cleaning in Python', url: 'https://www.youtube.com/watch?v=ZOX18HfLHGQ' },
      { title: 'Feature Scaling Explained', url: 'https://www.youtube.com/watch?v=mnKm3YP56pk' }
    ],
    reading: [
      { title: 'Pandas getting started', url: 'https://pandas.pydata.org/docs/getting_started/index.html' },
      { title: 'Preprocessing in sklearn', url: 'https://scikit-learn.org/stable/modules/preprocessing.html' }
    ],
    concepts: ['Missing values', 'Encoding categoricals', 'Scaling', 'Outliers', 'Train-only fitting'],
    tasks: ['Impute missing numeric values', 'One-hot encode a category column', 'Scale features without leaking test data'],
    project: { title: 'Clean Housing Dataset', description: 'Produce a reproducible notebook that cleans, encodes, and splits a housing CSV for modeling.' }
  }),
  'scikit-learn': roadmap({
    videos: [
      { title: 'scikit-learn Crash Course', url: 'https://www.youtube.com/watch?v=pqNCD_5r0IU' },
      { title: 'Pipelines in sklearn', url: 'https://www.youtube.com/watch?v=jzKSAeuaE5c' }
    ],
    reading: [
      { title: 'sklearn getting started', url: 'https://scikit-learn.org/stable/getting_started.html' },
      { title: 'Pipeline guide', url: 'https://scikit-learn.org/stable/modules/compose.html' }
    ],
    concepts: ['Estimators', 'fit/predict', 'Pipelines', 'GridSearchCV', 'Metrics module'],
    tasks: ['Build a Pipeline with scaler + model', 'Run cross-validation', 'Tune one hyperparameter'],
    project: { title: 'sklearn Pipeline Notebook', description: 'Create a pipeline that preprocesses data, trains a model, and prints a classification report.' }
  }),
  'deep-learning': roadmap({
    videos: [
      { title: 'Neural Networks (3Blue1Brown)', url: 'https://www.youtube.com/watch?v=aircAruvnKk' },
      { title: 'Deep Learning with PyTorch (beginner)', url: 'https://www.youtube.com/watch?v=V_xro1bcAuA' }
    ],
    reading: [
      { title: 'Deep Learning Book homepage', url: 'https://www.deeplearningbook.org/' },
      { title: 'PyTorch tutorials', url: 'https://pytorch.org/tutorials/' }
    ],
    concepts: ['Neurons and layers', 'Activation functions', 'Loss and backprop', 'Overfitting in NNs', 'CNN vs RNN at a high level'],
    tasks: ['Train a tiny network on a toy dataset', 'Plot training vs validation loss', 'Explain one architecture choice in writing'],
    project: { title: 'Digit Classifier Mini-Net', description: 'Train a small neural net on a digit dataset and report accuracy plus two failure examples.' }
  }),
  'model-evaluation': roadmap({
    videos: [
      { title: 'Classification Metrics Explained', url: 'https://www.youtube.com/watch?v=aDWATMLHP0s' },
      { title: 'Cross-Validation', url: 'https://www.youtube.com/watch?v=fSytzGwwBVw' }
    ],
    reading: [
      { title: 'sklearn model evaluation', url: 'https://scikit-learn.org/stable/modules/model_evaluation.html' },
      { title: 'Precision and recall', url: 'https://developers.google.com/machine-learning/crash-course/classification/precision-and-recall' }
    ],
    concepts: ['Accuracy vs F1', 'Confusion matrix', 'ROC/AUC', 'Cross-validation', 'Data leakage'],
    tasks: ['Compute precision/recall by hand from a matrix', 'Compare two models with the same metric', 'Document why accuracy can mislead'],
    project: { title: 'Model Scorecard', description: 'Evaluate one model with confusion matrix, F1, and a short note on which metric matters for the use case.' }
  }),
  'feature-engineering': roadmap({
    videos: [
      { title: 'Feature Engineering Basics', url: 'https://www.youtube.com/watch?v=iR3Oa9z-p1w' },
      { title: 'PCA intuitively', url: 'https://www.youtube.com/watch?v=FgakZw6K1QQ' }
    ],
    reading: [
      { title: 'sklearn feature extraction', url: 'https://scikit-learn.org/stable/modules/feature_extraction.html' },
      { title: 'Google ML feature engineering', url: 'https://developers.google.com/machine-learning/crash-course/representation/feature-engineering' }
    ],
    concepts: ['Derived features', 'Binning', 'Datetime parts', 'Feature importance', 'Dimensionality reduction'],
    tasks: ['Create ratio/interaction features', 'Encode cyclical time features', 'Compare model score before/after features'],
    project: { title: 'Feature Lab', description: 'Add at least 3 engineered features to a dataset and show whether validation score improved.' }
  }),
  'requirements-gathering': roadmap({
    videos: [
      { title: 'Requirements Gathering Techniques', url: 'https://www.youtube.com/watch?v=G6Pj9b0a2xE' },
      { title: 'Writing User Stories', url: 'https://www.youtube.com/watch?v=apOvF9oV2Aw' }
    ],
    reading: [
      { title: 'IIBA BABOK overview', url: 'https://www.iiba.org/career-resources/a-business-analysis-professionals-foundation-for-success/babok/' },
      { title: 'User story guide (Atlassian)', url: 'https://www.atlassian.com/agile/project-management/user-stories' }
    ],
    concepts: ['Interviews and workshops', 'User stories', 'Acceptance criteria', 'MoSCoW', 'Traceability'],
    tasks: ['Write 5 user stories with acceptance criteria', 'Draft a stakeholder interview script', 'Prioritize a backlog with MoSCoW'],
    project: { title: 'BRD Lite', description: 'Produce a short business requirements document for a campus attendance app.' }
  }),
  'swot-analysis': roadmap({
    videos: [
      { title: 'SWOT Analysis Explained', url: 'https://www.youtube.com/watch?v=I_6AVRGLXGA' },
      { title: 'How to run a SWOT workshop', url: 'https://www.youtube.com/watch?v=4a_eGgkYK2k' }
    ],
    reading: [
      { title: 'MindTools SWOT', url: 'https://www.mindtools.com/amtbj63/swot-analysis' },
      { title: 'Harvard Business SWOT overview', url: 'https://online.hbs.edu/blog/post/what-is-swot-analysis' }
    ],
    concepts: ['Strengths', 'Weaknesses', 'Opportunities', 'Threats', 'Turning SWOT into actions'],
    tasks: ['Complete a SWOT for a known product', 'Translate 2 items into initiatives', 'Challenge assumptions in a peer review'],
    project: { title: 'Product SWOT Brief', description: 'Write a one-page SWOT for a product and recommend three next actions.' }
  }),
  'uml-diagrams': roadmap({
    videos: [
      { title: 'UML Use Case Diagrams', url: 'https://www.youtube.com/watch?v=zid-MVo7M-E' },
      { title: 'UML Class Diagrams', url: 'https://www.youtube.com/watch?v=UI6lqHOVHic' }
    ],
    reading: [
      { title: 'UML diagrams overview', url: 'https://www.uml-diagrams.org/' },
      { title: 'Lucidchart UML tutorial', url: 'https://www.lucidchart.com/pages/uml-diagram' }
    ],
    concepts: ['Use case diagrams', 'Class diagrams', 'Sequence diagrams', 'Activity diagrams', 'Actors and relationships'],
    tasks: ['Draw a use case diagram for ATM', 'Model 5 classes for a shop', 'Sequence a login flow'],
    project: { title: 'System Model Pack', description: 'Deliver use case + class + sequence diagrams for an online bookstore.' }
  }),
  'stakeholder-management': roadmap({
    videos: [
      { title: 'Stakeholder Management Basics', url: 'https://www.youtube.com/watch?v=R8kK5p3aQbE' },
      { title: 'RACI Explained', url: 'https://www.youtube.com/watch?v=t2p8nM4L1dQ' }
    ],
    reading: [
      { title: 'Stakeholder analysis (PMI-style overview)', url: 'https://www.pmi.org/learning/library/stakeholder-analysis-pivotal-practice-projects-6708' },
      { title: 'RACI matrix guide', url: 'https://www.atlassian.com/work-management/project-management/raci-chart' }
    ],
    concepts: ['Power/interest grid', 'RACI', 'Communication plans', 'Conflict handling', 'Expectation setting'],
    tasks: ['Map 8 stakeholders on a grid', 'Draft a RACI for a release', 'Write a status update for executives vs engineers'],
    project: { title: 'Stakeholder Plan', description: 'Create a communication plan and RACI for a 6-week internal tool rollout.' }
  }),
  'agile-scrum': roadmap({
    videos: [
      { title: 'Agile Scrum Crash Course', url: 'https://www.youtube.com/watch?v=9TycLR0TqFA' },
      { title: 'Scrum Roles and Events', url: 'https://www.youtube.com/watch?v=gy1c4TTdIlo' }
    ],
    reading: [
      { title: 'Scrum Guide', url: 'https://scrumguides.org/scrum-guide.html' },
      { title: 'Atlassian Agile coach', url: 'https://www.atlassian.com/agile' }
    ],
    concepts: ['Sprints', 'Product owner / SM / developers', 'Backlog', 'Daily scrum', 'Definition of Done'],
    tasks: ['Split an epic into stories', 'Facilitate a mock standup agenda', 'Write a sprint goal'],
    project: { title: 'Sprint 0 Pack', description: 'Create a product backlog of 10 stories and a 2-week sprint plan for a helpdesk app.' }
  }),
  'jira': roadmap({
    videos: [
      { title: 'Jira Tutorial for Beginners', url: 'https://www.youtube.com/watch?v=V8BuIA3cdzU' },
      { title: 'Jira Boards and Backlogs', url: 'https://www.youtube.com/watch?v=6iU9EYC7b3I' }
    ],
    reading: [
      { title: 'Jira Software docs', url: 'https://www.atlassian.com/software/jira/guides' },
      { title: 'Creating issues', url: 'https://support.atlassian.com/jira-software-cloud/docs/create-and-work-with-issues/' }
    ],
    concepts: ['Issue types', 'Boards', 'Workflows', 'Filters/JQL', 'Epics and sprints'],
    tasks: ['Create a sample project board', 'Write 5 well-structured tickets', 'Build a simple JQL filter'],
    project: { title: 'Team Jira Workspace', description: 'Set up epics, stories, and a sprint board for a fictional team, including bug workflow.' }
  }),
  'business-process-modeling': roadmap({
    videos: [
      { title: 'BPMN for Beginners', url: 'https://www.youtube.com/watch?v=B1T07JlBY-I' },
      { title: 'Process Mapping Basics', url: 'https://www.youtube.com/watch?v=3o_v5V7m4pA' }
    ],
    reading: [
      { title: 'BPMN specification intro', url: 'https://www.omg.org/spec/BPMN/' },
      { title: 'Camunda BPMN tutorial', url: 'https://docs.camunda.org/manual/latest/introduction/' }
    ],
    concepts: ['As-is vs to-be', 'BPMN events/tasks/gateways', 'Swimlanes', 'Handoffs', 'Bottlenecks'],
    tasks: ['Map an order-to-cash as-is flow', 'Identify two bottlenecks', 'Propose a to-be path'],
    project: { title: 'Onboarding Process Map', description: 'Model employee onboarding with swimlanes and recommend one automation.' }
  }),
  'reporting': roadmap({
    videos: [
      { title: 'Writing Effective Business Reports', url: 'https://www.youtube.com/watch?v=O-zupTQ-hH0' },
      { title: 'Dashboard Storytelling', url: 'https://www.youtube.com/watch?v=8EMW7io4aNk' }
    ],
    reading: [
      { title: 'How to write a business report', url: 'https://www.northeastern.edu/graduate/blog/how-to-write-a-report/' },
      { title: 'Data storytelling', url: 'https://www.tableau.com/learn/articles/data-storytelling' }
    ],
    concepts: ['Audience', 'Executive summary', 'Evidence vs opinion', 'Visuals that support claims', 'Recommendations'],
    tasks: ['Write a 1-page exec summary', 'Turn a table into a recommendation', 'Review a report for bias'],
    project: { title: 'Weekly Ops Report', description: 'Produce a one-page report with 3 metrics, a chart, risks, and recommended actions.' }
  }),
  'manual-testing': roadmap({
    videos: [
      { title: 'Software Testing Full Course', url: 'https://www.youtube.com/watch?v=sO8eGL6SFsA' },
      { title: 'Types of Testing Explained', url: 'https://www.youtube.com/watch?v=u6QfIXgjwGQ' }
    ],
    reading: [
      { title: 'ISTQB syllabus (CTFL)', url: 'https://www.istqb.org/certifications/certified-tester-foundation-level' },
      { title: 'Testing overview (Guru99)', url: 'https://www.guru99.com/software-testing.html' }
    ],
    concepts: ['Test levels', 'Smoke vs regression', 'Exploratory testing', 'Positive/negative tests', 'UAT'],
    tasks: ['Write 10 manual tests for login', 'Run an exploratory session with notes', 'Log 3 defects from a public site'],
    project: { title: 'Manual Test Pack', description: 'Deliver a test plan and 15 cases for a signup/login flow including negative paths.' }
  }),
  'test-cases': roadmap({
    videos: [
      { title: 'How to Write Test Cases', url: 'https://www.youtube.com/watch?v=Rqe1UmP9u2E' },
      { title: 'Equivalence Partitioning & BVA', url: 'https://www.youtube.com/watch?v=6g0K0x8z0kE' }
    ],
    reading: [
      { title: 'Test case design techniques', url: 'https://www.guru99.com/testing-techniques.html' },
      { title: 'IEEE 829 overview', url: 'https://en.wikipedia.org/wiki/IEEE_829' }
    ],
    concepts: ['Preconditions', 'Steps and expected results', 'Boundary value analysis', 'Equivalence partitions', 'Traceability to requirements'],
    tasks: ['Convert 3 requirements into cases', 'Add boundary tests for an age field', 'Peer review a teammate’s cases'],
    project: { title: 'Checkout Test Suite', description: 'Write 20 test cases for cart and checkout covering happy path, validation, and payments.' }
  }),
  'selenium': roadmap({
    videos: [
      { title: 'Selenium Java Beginner Course', url: 'https://www.youtube.com/watch?v=FRn5J31eAVw' },
      { title: 'Selenium WebDriver Basics', url: 'https://www.youtube.com/watch?v=XJhV3jQGz6s' }
    ],
    reading: [
      { title: 'Selenium documentation', url: 'https://www.selenium.dev/documentation/' },
      { title: 'WebDriver getting started', url: 'https://www.selenium.dev/documentation/webdriver/getting_started/' }
    ],
    concepts: ['Locators', 'Waits', 'Page actions', 'Assertions', 'Test frameworks'],
    tasks: ['Open a site and assert the title', 'Fill and submit a form', 'Use an explicit wait'],
    project: { title: 'Login Automation', description: 'Automate valid/invalid login tests with reusable locator helpers.' }
  }),
  'api-testing': roadmap({
    videos: [
      { title: 'Postman Beginner Tutorial', url: 'https://www.youtube.com/watch?v=VywxIQ2ZXw4' },
      { title: 'API Testing Crash Course', url: 'https://www.youtube.com/watch?v=KbBMs_7bHuo' }
    ],
    reading: [
      { title: 'Postman learning center', url: 'https://learning.postman.com/docs/getting-started/overview/' },
      { title: 'HTTP status codes', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Status' }
    ],
    concepts: ['Requests and collections', 'Status assertions', 'JSON schema checks', 'Auth headers', 'Environments'],
    tasks: ['Test GET/POST on a public API', 'Write 3 Postman tests', 'Parameterize a base URL'],
    project: { title: 'API Regression Collection', description: 'Build a Postman collection for CRUD endpoints with automated tests and an environment file.' }
  }),
  'bug-reporting': roadmap({
    videos: [
      { title: 'How to Write a Good Bug Report', url: 'https://www.youtube.com/watch?v=5m7n10z9g2A' },
      { title: 'Severity vs Priority', url: 'https://www.youtube.com/watch?v=4gY8m0n0m1E' }
    ],
    reading: [
      { title: 'Effective bug reports', url: 'https://www.guru99.com/defect-management-process.html' },
      { title: 'MDN reporting bugs (example quality)', url: 'https://developer.mozilla.org/en-US/docs/Mozilla/QA/Bug_writing_guidelines' }
    ],
    concepts: ['Repro steps', 'Expected vs actual', 'Environment', 'Severity vs priority', 'Attachments'],
    tasks: ['File 3 bugs with screenshots', 'Rewrite a vague bug into a clear one', 'Triage 5 sample bugs'],
    project: { title: 'Defect Log', description: 'Create a defect log of 8 issues for a sample app with severity, priority, and status.' }
  }),
  'agile-testing': roadmap({
    videos: [
      { title: 'Agile Testing Explained', url: 'https://www.youtube.com/watch?v=0r4Q8z-2p1E' },
      { title: 'Shift-Left Testing (beginner courses)', url: ytCourse('shift left testing') }
    ],
    reading: [
      { title: 'Agile testing overview', url: 'https://www.atlassian.com/continuous-delivery/software-testing/agile-testing' },
      { title: 'Definition of Done', url: 'https://www.scrum.org/resources/blog/done-understanding-definition-done' }
    ],
    concepts: ['Testing in sprints', 'DoD', 'Shift left', 'BDD basics', 'Continuous testing'],
    tasks: ['Define DoD for a story', 'Write Given/When/Then scenarios', 'Plan test activities for a 2-week sprint'],
    project: { title: 'Sprint Test Strategy', description: 'Write a one-sprint test approach covering story tests, regression, and automation candidates.' }
  }),
  'test-planning': roadmap({
    videos: [
      { title: 'How to Write a Test Plan', url: 'https://www.youtube.com/watch?v=kWUreW2nO8Q' },
      { title: 'Test Strategy vs Test Plan (beginner courses)', url: ytCourse('test strategy vs test plan') }
    ],
    reading: [
      { title: 'ISTQB test planning', url: 'https://www.guru99.com/what-everybody-ought-to-know-about-test-planing.html' },
      { title: 'Risk-based testing', url: 'https://www.guru99.com/risk-analysis-software-testing.html' }
    ],
    concepts: ['Scope', 'Entry/exit criteria', 'Resources and schedule', 'Risks', 'Environment'],
    tasks: ['Draft entry/exit criteria', 'List test environments', 'Identify top 5 product risks'],
    project: { title: 'Release Test Plan', description: 'Write a test plan for a v1.0 web release including scope, risks, and schedule.' }
  }),
  'figma': roadmap({
    videos: [
      { title: 'Figma Tutorial for Beginners', url: 'https://www.youtube.com/watch?v=FTFaQWZBqQ8' },
      { title: 'Figma Auto Layout (beginner courses)', url: ytCourse('Figma auto layout tutorial') }
    ],
    reading: [
      { title: 'Figma Learn', url: 'https://help.figma.com/hc/en-us' },
      { title: 'Figma components', url: 'https://help.figma.com/hc/en-us/articles/360038662654-Guide-to-components-in-Figma' }
    ],
    concepts: ['Frames', 'Components', 'Auto layout', 'Variants', 'Prototyping links'],
    tasks: ['Recreate a mobile login screen', 'Build a button component with variants', 'Prototype a 3-screen flow'],
    project: { title: 'App UI Kit Starter', description: 'Create a Figma file with colors, type, buttons, and two key screens for a habit tracker.' }
  }),
  'design-principles': roadmap({
    videos: [
      { title: 'UI Design Principles', url: 'https://www.youtube.com/watch?v=aJQs1kHH8dA' },
      { title: 'Visual Hierarchy', url: 'https://www.youtube.com/watch?v=qZWdN_G5aCQ' }
    ],
    reading: [
      { title: 'Laws of UX', url: 'https://lawsofux.com/' },
      { title: 'Refactoring UI notes', url: 'https://www.refactoringui.com/' }
    ],
    concepts: ['Hierarchy', 'Contrast', 'Alignment', 'Proximity', 'Consistency'],
    tasks: ['Critique a popular homepage', 'Restyle a cluttered card', 'Apply an 8px spacing system'],
    project: { title: 'Before/After Redesign', description: 'Redesign one messy screen and annotate which principles you applied.' }
  }),
  'user-research': roadmap({
    videos: [
      { title: 'UX Research for Beginners', url: 'https://www.youtube.com/watch?v=bAARmsv1tF4' },
      { title: 'How to Interview Users', url: 'https://www.youtube.com/watch?v=Q4ln8p0qLBg' }
    ],
    reading: [
      { title: 'NN/g user research', url: 'https://www.nngroup.com/articles/which-ux-research-methods/' },
      { title: 'Interviewing users', url: 'https://www.nngroup.com/articles/user-interviews/' }
    ],
    concepts: ['Research methods', 'Interviews', 'Personas', 'Journey maps', 'Synthesizing insights'],
    tasks: ['Write a research plan', 'Conduct 2 practice interviews', 'Turn notes into 3 insights'],
    project: { title: 'Research Brief', description: 'Run lightweight research for a campus app and deliver personas plus a journey map.' }
  }),
  'wireframing': roadmap({
    videos: [
      { title: 'Wireframing Tutorial', url: 'https://www.youtube.com/watch?v=qpH7-KFWZRI' },
      { title: 'Low-fi vs High-fi (beginner courses)', url: ytCourse('low fidelity vs high fidelity wireframes') }
    ],
    reading: [
      { title: 'NN/g wireframing', url: 'https://www.nngroup.com/articles/wireframing-101/' },
      { title: 'Figma wireframe kits docs', url: 'https://help.figma.com/hc/en-us/articles/360041051214' }
    ],
    concepts: ['Information architecture', 'Low-fidelity layouts', 'Content priority', 'Grids', 'Annotation'],
    tasks: ['Sketch 4 mobile screens on paper', 'Digitize them in grayscale', 'Get critique and revise one flow'],
    project: { title: 'Onboarding Wireframes', description: 'Produce lo-fi wireframes for signup, empty state, and home for a notes app.' }
  }),
  'prototyping': roadmap({
    videos: [
      { title: 'Figma Prototyping Tutorial (beginner courses)', url: ytCourse('Figma prototyping tutorial for beginners') },
      { title: 'Microinteractions', url: 'https://www.youtube.com/watch?v=wIuVP0j4QfI' }
    ],
    reading: [
      { title: 'Figma prototyping help', url: 'https://help.figma.com/hc/en-us/articles/360040328653-Create-prototypes' },
      { title: 'NN/g prototyping', url: 'https://www.nngroup.com/articles/prototyping/' }
    ],
    concepts: ['User flows', 'Interactive hotspots', 'Transitions', 'Fidelity choices', 'Testable prototypes'],
    tasks: ['Prototype a 5-screen flow', 'Add overlay states', 'Share a prototype link for feedback'],
    project: { title: 'Clickable Checkout', description: 'Build a clickable prototype of cart → address → payment → success with error states.' }
  }),
  'usability-testing': roadmap({
    videos: [
      { title: 'Usability Testing Basics (beginner courses)', url: ytCourse('usability testing for beginners') },
      { title: 'Think-Aloud Testing (beginner courses)', url: ytCourse('think aloud usability testing') }
    ],
    reading: [
      { title: 'NN/g usability testing', url: 'https://www.nngroup.com/articles/usability-testing-101/' },
      { title: 'How many users', url: 'https://www.nngroup.com/articles/why-you-only-need-to-test-with-5-users/' }
    ],
    concepts: ['Test plan', 'Tasks and success metrics', 'Moderated vs unmoderated', 'Severity ratings', 'Findings report'],
    tasks: ['Write 4 usability tasks', 'Run a test with one peer', 'Log issues with severity'],
    project: { title: 'Usability Findings Deck', description: 'Test a prototype with 3 users and report top issues with recommendations.' }
  }),
  'color-theory': roadmap({
    videos: [
      { title: 'Color Theory for Designers', url: 'https://www.youtube.com/watch?v=_2LLXnUdUIc' },
      { title: 'Accessible Color Contrast', url: 'https://www.youtube.com/watch?v=rQ-8eXoY1iA' }
    ],
    reading: [
      { title: 'Adobe color wheel', url: 'https://color.adobe.com/create/color-wheel' },
      { title: 'WebAIM contrast checker', url: 'https://webaim.org/resources/contrastchecker/' }
    ],
    concepts: ['Hue/saturation/value', 'Harmony', '60-30-10', 'Contrast', 'Color meaning'],
    tasks: ['Build a 5-color palette', 'Check contrast of text on background', 'Apply palette to a UI card'],
    project: { title: 'Brand Color System', description: 'Define primary/secondary/neutral colors with contrast-checked text styles.' }
  }),
  'accessibility': roadmap({
    videos: [
      { title: 'Web Accessibility Crash Course', url: 'https://www.youtube.com/watch?v=eAXj4pVnTzE' },
      { title: 'ARIA and Keyboard Access', url: 'https://www.youtube.com/watch?v=0u_q6L3o9lQ' }
    ],
    reading: [
      { title: 'WCAG overview', url: 'https://www.w3.org/WAI/standards-guidelines/wcag/' },
      { title: 'MDN accessibility', url: 'https://developer.mozilla.org/en-US/docs/Web/Accessibility' }
    ],
    concepts: ['WCAG principles', 'Contrast', 'Keyboard navigation', 'Alt text', 'ARIA when needed'],
    tasks: ['Audit a page with Lighthouse a11y', 'Fix contrast on 3 components', 'Navigate a flow with keyboard only'],
    project: { title: 'Accessible Form Screen', description: 'Design and specify an accessible form with labels, errors, focus order, and contrast notes.' }
  })
};

export function getRoadmap(topicName) {
  const normalized = topicName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-$/, '');
  if (roadmaps[normalized]) return roadmaps[normalized];
  return roadmap({
    videos: [
      { title: `${topicName} Full Course for Beginners`, url: ytCourse(topicName) },
      { title: `${topicName} Crash Course`, url: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${topicName} crash course`)}` }
    ],
    reading: [
      { title: `${topicName} official documentation`, url: `https://www.google.com/search?q=${encodeURIComponent(`${topicName} official documentation`)}` },
      { title: `${topicName} beginner guide`, url: `https://www.google.com/search?q=${encodeURIComponent(`${topicName} beginner guide`)}` }
    ],
    concepts: [
      `What ${topicName} is used for`,
      `Core building blocks of ${topicName}`,
      `Common mistakes in ${topicName}`,
      `How to practice ${topicName} daily`
    ],
    tasks: [
      `Watch one beginner ${topicName} course`,
      `Complete a small tutorial in ${topicName}`,
      `Write notes on 5 key terms`
    ],
    project: {
      title: `${topicName} Starter Project`,
      description: `Build a small project that proves you can apply the basics of ${topicName}, including error handling and a short write-up of what you learned.`
    }
  });
}
