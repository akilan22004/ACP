import { extraQuestions } from './questionsExtra.js';

const coreQuestions = [
  // Java Full Stack Developer
  // Stage 1
  { id: 'q1', stage: 1, career: 'java-full-stack', question: "Which keyword is used to define a class in Java?", options: ["class","Class","define","object"], correct: 0, skill: "Java Basics" },
  { id: 'q2', stage: 1, career: 'java-full-stack', question: "What does OOP stand for?", options: ["Object Oriented Programming","Open Object Programming","Object Output Program","Ordered Object Process"], correct: 0, skill: "OOP" },
  { id: 'q3', stage: 1, career: 'java-full-stack', question: "Which HTML tag is used for a hyperlink?", options: ["<link>","<a>","<href>","<url>"], correct: 1, skill: "HTML/CSS" },
  { id: 'q4', stage: 1, career: 'java-full-stack', question: "Which company developed JavaScript?", options: ["Microsoft","Google","Netscape","Apple"], correct: 2, skill: "JavaScript" },
  { id: 'q5', stage: 1, career: 'java-full-stack', question: "What does SQL stand for?", options: ["Structured Query Language","Simple Query Logic","Sequential Query Language","Standard Query List"], correct: 0, skill: "SQL" },
  // Stage 2
  { id: 'q6', stage: 2, career: 'java-full-stack', question: "Which of the following is NOT a Java OOP principle?", options: ["Encapsulation","Polymorphism","Compilation","Inheritance"], correct: 2, skill: "OOP" },
  { id: 'q7', stage: 2, career: 'java-full-stack', question: "In React, what is used to manage component state?", options: ["setState only","useState hook","this.state only","props"], correct: 1, skill: "React" },
  { id: 'q8', stage: 2, career: 'java-full-stack', question: "What is the purpose of Spring Boot?", options: ["Frontend framework","Database management","Rapid Spring application setup","CSS styling"], correct: 2, skill: "Spring Boot" },
  { id: 'q9', stage: 2, career: 'java-full-stack', question: "Which HTTP method is used to update a resource in REST API?", options: ["GET","POST","PUT","DELETE"], correct: 2, skill: "REST API" },
  { id: 'q10', stage: 2, career: 'java-full-stack', question: "What does SELECT * FROM users; do in SQL?", options: ["Delete all users","Update all users","Insert a user","Retrieve all rows from users table"], correct: 3, skill: "SQL" },
  // Stage 3
  { id: 'q11', stage: 3, career: 'java-full-stack', question: "In a Spring Boot REST API, which annotation marks a class as a REST controller?", options: ["@Service","@RestController","@Repository","@Component"], correct: 1, skill: "Spring Boot" },
  { id: 'q12', stage: 3, career: 'java-full-stack', question: "Which React hook is used for side effects?", options: ["useState","useEffect","useRef","useContext"], correct: 1, skill: "React" },
  { id: 'q13', stage: 3, career: 'java-full-stack', question: "What is the N+1 problem in SQL?", options: ["A syntax error","Too many columns","Running one query per related record instead of a join","Missing primary key"], correct: 2, skill: "SQL" },
  { id: 'q14', stage: 3, career: 'java-full-stack', question: "What does CORS stand for?", options: ["Cross Origin Resource Sharing","Client Object Rendering System","Cross Object Response Sharing","Client Origin Request System"], correct: 0, skill: "REST API" },
  { id: 'q15', stage: 3, career: 'java-full-stack', question: "In OOP, what is method overriding?", options: ["Creating a new method","Hiding a method","Redefining a parent method in a child class","Calling a static method"], correct: 2, skill: "OOP" },

  // Data Analyst
  // Stage 1
  { id: 'q16', stage: 1, career: 'data-analyst', question: "What does ETL stand for?", options: ["Extract Transform Load","Edit Transfer List","Export Table Logic","Evaluate Test Load"], correct: 0, skill: "ETL" },
  { id: 'q17', stage: 1, career: 'data-analyst', question: "Which function counts non-null cells in Excel?", options: ["SUM","COUNT","AVERAGE","COUNTA"], correct: 1, skill: "Excel" },
  { id: 'q18', stage: 1, career: 'data-analyst', question: "What does SQL GROUP BY clause do?", options: ["Sorts data","Groups rows with same values","Filters rows","Joins tables"], correct: 1, skill: "SQL" },
  { id: 'q19', stage: 1, career: 'data-analyst', question: "Which chart type is best for showing trends over time?", options: ["Pie chart","Bar chart","Line chart","Scatter plot"], correct: 2, skill: "Data Visualization" },
  { id: 'q20', stage: 1, career: 'data-analyst', question: "What is mean in statistics?", options: ["Most frequent value","Middle value","Sum divided by count","Range of values"], correct: 2, skill: "Statistics" },
  // Stage 2
  { id: 'q21', stage: 2, career: 'data-analyst', question: "In Python, which library is used for data manipulation?", options: ["NumPy","Pandas","Matplotlib","Scikit-learn"], correct: 1, skill: "Python" },
  { id: 'q22', stage: 2, career: 'data-analyst', question: "What is a primary key in a database?", options: ["Any column","A foreign reference","A unique identifier for each row","An indexed column"], correct: 2, skill: "SQL" },
  { id: 'q23', stage: 2, career: 'data-analyst', question: "Which BI tool uses DAX formulas?", options: ["Tableau","Power BI","Excel","Looker"], correct: 1, skill: "Business Intelligence" },
  { id: 'q24', stage: 2, career: 'data-analyst', question: "What is an outlier in a dataset?", options: ["The median","A missing value","A data point far from others","The mode"], correct: 2, skill: "Statistics" },
  { id: 'q25', stage: 2, career: 'data-analyst', question: "Which Python function reads a CSV file?", options: ["pd.read_excel()","pd.read_csv()","pd.load_csv()","pd.import_csv()"], correct: 1, skill: "Python" },
  // Stage 3
  { id: 'q26', stage: 3, career: 'data-analyst', question: "What is data normalization?", options: ["Removing columns","Scaling data to a standard range","Adding more rows","Sorting alphabetically"], correct: 1, skill: "Data Visualization" },
  { id: 'q27', stage: 3, career: 'data-analyst', question: "What is the purpose of a JOIN in SQL?", options: ["Delete rows","Combine rows from two or more tables","Sort data","Count rows"], correct: 1, skill: "SQL" },
  { id: 'q28', stage: 3, career: 'data-analyst', question: "What does KPI stand for?", options: ["Key Performance Indicator","Known Process Improvement","Key Program Interface","Knowledge Process Integration"], correct: 0, skill: "Business Intelligence" },
  { id: 'q29', stage: 3, career: 'data-analyst', question: "In statistics, what is the standard deviation?", options: ["Average value","Range of data","Measure of data spread from the mean","Most frequent value"], correct: 2, skill: "Statistics" },
  { id: 'q30', stage: 3, career: 'data-analyst', question: "Which Python library is used for data visualization?", options: ["Pandas","NumPy","Matplotlib","Requests"], correct: 2, skill: "Python" },

  // Data Scientist
  // Stage 1
  { id: 'q31', stage: 1, career: 'data-scientist', question: "What does ML stand for?", options: ["Machine Learning","Model Logic","Main Library","Measurement Layer"], correct: 0, skill: "Machine Learning" },
  { id: 'q32', stage: 1, career: 'data-scientist', question: "Which Python library provides machine learning algorithms?", options: ["Pandas","Matplotlib","Scikit-learn","Flask"], correct: 2, skill: "Scikit-learn" },
  { id: 'q33', stage: 1, career: 'data-scientist', question: "What is supervised learning?", options: ["Learning without labels","Learning with labeled data","Reinforcement based learning","Unsupervised clustering"], correct: 1, skill: "Machine Learning" },
  { id: 'q34', stage: 1, career: 'data-scientist', question: "What is a train-test split?", options: ["Splitting code into files","Dividing data into training and testing sets","Training two models","Testing on training data"], correct: 1, skill: "Model Evaluation" },
  { id: 'q35', stage: 1, career: 'data-scientist', question: "What does NaN mean in data?", options: ["Not a Number","Null and None","New Array Notation","Nested and Null"], correct: 0, skill: "Data Preprocessing" },
  // Stage 2
  { id: 'q36', stage: 2, career: 'data-scientist', question: "What is overfitting in ML?", options: ["Model underperfoms on training","Model performs well on training but poorly on test","Model has too few features","Model is too simple"], correct: 1, skill: "Model Evaluation" },
  { id: 'q37', stage: 2, career: 'data-scientist', question: "What is feature engineering?", options: ["Creating software features","Transforming raw data into meaningful inputs for ML","Selecting a model","Plotting graphs"], correct: 1, skill: "Feature Engineering" },
  { id: 'q38', stage: 2, career: 'data-scientist', question: "Which algorithm is used for classification?", options: ["Linear Regression","K-Means","Random Forest","PCA"], correct: 2, skill: "Machine Learning" },
  { id: 'q39', stage: 2, career: 'data-scientist', question: "What does PCA stand for?", options: ["Primary Component Algorithm","Principal Component Analysis","Predictive Cluster Analysis","Partial Calculation Algorithm"], correct: 1, skill: "Feature Engineering" },
  { id: 'q40', stage: 2, career: 'data-scientist', question: "What is the purpose of cross-validation?", options: ["To train faster","To test on training data","To estimate model performance reliably","To reduce features"], correct: 2, skill: "Model Evaluation" },
  // Stage 3
  { id: 'q41', stage: 3, career: 'data-scientist', question: "What is a confusion matrix?", options: ["A table showing correct/incorrect predictions per class","A matrix for data preprocessing","A neural network layer","A clustering result"], correct: 0, skill: "Model Evaluation" },
  { id: 'q42', stage: 3, career: 'data-scientist', question: "What is deep learning?", options: ["Learning from databases","A subset of ML using multi-layer neural networks","Learning from spreadsheets","A data cleaning technique"], correct: 1, skill: "Deep Learning" },
  { id: 'q43', stage: 3, career: 'data-scientist', question: "Which metric measures precision and recall together?", options: ["Accuracy","AUC","F1 Score","MSE"], correct: 2, skill: "Model Evaluation" },
  { id: 'q44', stage: 3, career: 'data-scientist', question: "What is the activation function in neural networks?", options: ["A loss function","A function that adds non-linearity to the network","A training algorithm","A regularization method"], correct: 1, skill: "Deep Learning" },
  { id: 'q45', stage: 3, career: 'data-scientist', question: "What is regularization in ML?", options: ["Cleaning data","Normalizing features","Technique to prevent overfitting by penalizing complexity","Splitting data"], correct: 2, skill: "Machine Learning" },

  // Business Analyst
  // Stage 1
  { id: 'q46', stage: 1, career: 'business-analyst', question: "What does SWOT stand for?", options: ["Strengths Weaknesses Opportunities Threats","Systems Workflow Operations Tasks","Standard Work Output Testing","Stakeholder Workflow Objectives Timeline"], correct: 0, skill: "Business Analysis" },
  { id: 'q47', stage: 1, career: 'business-analyst', question: "What is a use case diagram?", options: ["A flowchart for code","A UML diagram showing user interactions with a system","A database schema","A test case document"], correct: 1, skill: "UML Diagrams" },
  { id: 'q48', stage: 1, career: 'business-analyst', question: "What is Agile methodology?", options: ["A waterfall approach","A sequential development method","An iterative approach to project development","A testing framework"], correct: 2, skill: "Agile/Scrum" },
  { id: 'q49', stage: 1, career: 'business-analyst', question: "What is a stakeholder?", options: ["A developer","Anyone with interest in the project outcome","Only the client","The project manager"], correct: 1, skill: "Stakeholder Management" },
  { id: 'q50', stage: 1, career: 'business-analyst', question: "What does BPM stand for?", options: ["Business Process Modeling","Basic Program Management","Business Product Marketing","Base Process Mapping"], correct: 0, skill: "Business Process Modeling" },
  // Stage 2
  { id: 'q51', stage: 2, career: 'business-analyst', question: "What is a sprint in Scrum?", options: ["A final release","A time-boxed iteration of work","A daily meeting","A bug fix session"], correct: 1, skill: "Agile/Scrum" },
  { id: 'q52', stage: 2, career: 'business-analyst', question: "What is a user story?", options: ["A bug report","A technical specification","A short description of a feature from the user perspective","A test plan"], correct: 2, skill: "Requirements Gathering" },
  { id: 'q53', stage: 2, career: 'business-analyst', question: "What is JIRA primarily used for?", options: ["Code editing","Database management","Issue and project tracking","Design mockups"], correct: 2, skill: "Agile/Scrum" },
  { id: 'q54', stage: 2, career: 'business-analyst', question: "What is gap analysis?", options: ["Comparing current state to desired future state","Analyzing code bugs","Reviewing test cases","Auditing finances"], correct: 0, skill: "Business Analysis" },
  { id: 'q55', stage: 2, career: 'business-analyst', question: "Which document captures all project requirements?", options: ["Test Plan","BRD (Business Requirements Document)","Code Review","Sprint Backlog"], correct: 1, skill: "Requirements Gathering" },
  // Stage 3
  { id: 'q56', stage: 3, career: 'business-analyst', question: "What is a KPI?", options: ["Key Performance Indicator","Known Process Integration","Key Program Interface","Knowledge Performance Index"], correct: 0, skill: "Business Analysis" },
  { id: 'q57', stage: 3, career: 'business-analyst', question: "What is the purpose of a feasibility study?", options: ["To write code","To test the product","To assess whether a project is viable","To deploy the application"], correct: 2, skill: "Business Analysis" },
  { id: 'q58', stage: 3, career: 'business-analyst', question: "What is change management in business analysis?", options: ["Changing code","Managing the transition and adoption of new processes","Updating the database","Revising test cases"], correct: 1, skill: "Stakeholder Management" },
  { id: 'q59', stage: 3, career: 'business-analyst', question: "What is an ERD?", options: ["Entity Relationship Diagram","External Resource Document","Error Response Data","Estimated Release Date"], correct: 0, skill: "UML Diagrams" },
  { id: 'q60', stage: 3, career: 'business-analyst', question: "What is the MoSCoW method?", options: ["A database technique","A prioritization framework for requirements","A testing strategy","A deployment model"], correct: 1, skill: "Requirements Gathering" },

  // QA/Software Tester
  // Stage 1
  { id: 'q61', stage: 1, career: 'qa-tester', question: "What is the purpose of a test case?", options: ["To write code","To document steps to verify a specific feature","To deploy software","To design UI"], correct: 1, skill: "Test Cases" },
  { id: 'q62', stage: 1, career: 'qa-tester', question: "What is regression testing?", options: ["Testing new features only","Retesting fixed bugs to confirm no new bugs introduced","Performance testing","Security testing"], correct: 1, skill: "Manual Testing" },
  { id: 'q63', stage: 1, career: 'qa-tester', question: "What is a bug report?", options: ["A feature request","A document describing a defect found in software","A test plan","A sprint summary"], correct: 1, skill: "Bug Reporting" },
  { id: 'q64', stage: 1, career: 'qa-tester', question: "What does JIRA help with in QA?", options: ["Writing code","Tracking bugs and test progress","Designing UI","Database queries"], correct: 1, skill: "JIRA" },
  { id: 'q65', stage: 1, career: 'qa-tester', question: "What is smoke testing?", options: ["Testing all features","A quick check to ensure basic functionality works","Performance testing under load","Testing error messages"], correct: 1, skill: "Manual Testing" },
  // Stage 2
  { id: 'q66', stage: 2, career: 'qa-tester', question: "What is Selenium used for?", options: ["Backend development","Automated web browser testing","Database testing","Performance testing"], correct: 1, skill: "Selenium" },
  { id: 'q67', stage: 2, career: 'qa-tester', question: "What is API testing?", options: ["Testing user interfaces","Testing application programming interfaces","Testing databases","Testing mobile apps"], correct: 1, skill: "API Testing" },
  { id: 'q68', stage: 2, career: 'qa-tester', question: "What is a test plan?", options: ["A list of bugs","A document describing testing scope and approach","A code review","A deployment guide"], correct: 1, skill: "Test Planning" },
  { id: 'q69', stage: 2, career: 'qa-tester', question: "What does UAT stand for?", options: ["Unit Acceptance Testing","User Acceptance Testing","Unified Automation Testing","User Application Test"], correct: 1, skill: "Manual Testing" },
  { id: 'q70', stage: 2, career: 'qa-tester', question: "In Agile, who is responsible for testing?", options: ["Only QA engineers","Only developers","The whole team including QA","Only the manager"], correct: 2, skill: "Agile Testing" },
  // Stage 3
  { id: 'q71', stage: 3, career: 'qa-tester', question: "What is the difference between verification and validation?", options: ["No difference","Verification checks process, validation checks product meets user needs","Validation checks process, verification checks product","Both check code quality"], correct: 1, skill: "Manual Testing" },
  { id: 'q72', stage: 3, career: 'qa-tester', question: "What is a Selenium WebDriver?", options: ["A browser plugin","An API for controlling browsers programmatically","A test reporting tool","A performance tool"], correct: 1, skill: "Selenium" },
  { id: 'q73', stage: 3, career: 'qa-tester', question: "What is boundary value analysis?", options: ["Testing only middle values","Testing at the edges of valid input ranges","Analyzing code boundaries","Checking output limits"], correct: 1, skill: "Test Cases" },
  { id: 'q74', stage: 3, career: 'qa-tester', question: "What is the purpose of a test summary report?", options: ["To write new tests","To summarize testing activities and results","To fix bugs","To plan sprints"], correct: 1, skill: "Test Planning" },
  { id: 'q75', stage: 3, career: 'qa-tester', question: "What is performance testing?", options: ["Testing UI designs","Checking if software meets performance requirements under load","Testing only APIs","Unit testing functions"], correct: 1, skill: "Manual Testing" },

  // UI/UX Designer
  // Stage 1
  { id: 'q76', stage: 1, career: 'ui-ux-designer', question: "What is Figma primarily used for?", options: ["Backend coding","UI/UX design and prototyping","Database management","DevOps automation"], correct: 1, skill: "Figma" },
  { id: 'q77', stage: 1, career: 'ui-ux-designer', question: "What is a wireframe?", options: ["A finished design","A low-fidelity skeletal layout of a screen","A color palette","A code structure"], correct: 1, skill: "Wireframing" },
  { id: 'q78', stage: 1, career: 'ui-ux-designer', question: "What does UX stand for?", options: ["User eXperience","Universal eXchange","Unit eXecution","Unified eXploration"], correct: 0, skill: "Design Principles" },
  { id: 'q79', stage: 1, career: 'ui-ux-designer', question: "What is the primary goal of usability testing?", options: ["To write code","To evaluate a product with real users","To create wireframes","To choose colors"], correct: 1, skill: "Usability Testing" },
  { id: 'q80', stage: 1, career: 'ui-ux-designer', question: "What is the 60-30-10 rule in design?", options: ["Font sizes","Grid columns","Color distribution (dominant, secondary, accent)","Spacing rule"], correct: 2, skill: "Color Theory" },
  // Stage 2
  { id: 'q81', stage: 2, career: 'ui-ux-designer', question: "What is a prototype in UI/UX?", options: ["A final product","An interactive simulation of a design","A style guide","A code component"], correct: 1, skill: "Prototyping" },
  { id: 'q82', stage: 2, career: 'ui-ux-designer', question: "What is user research?", options: ["Researching code","Gathering insights about user needs and behaviors","Reviewing competitors' designs","Writing technical specs"], correct: 1, skill: "User Research" },
  { id: 'q83', stage: 2, career: 'ui-ux-designer', question: "What does accessibility mean in design?", options: ["Making designs colorful","Ensuring designs can be used by people with disabilities","Adding animations","Using dark themes"], correct: 1, skill: "Accessibility" },
  { id: 'q84', stage: 2, career: 'ui-ux-designer', question: "What is a design system?", options: ["An OS for designers","A collection of reusable components and guidelines","A prototyping tool","A color wheel"], correct: 1, skill: "Design Principles" },
  { id: 'q85', stage: 2, career: 'ui-ux-designer', question: "What is the contrast ratio requirement for WCAG AA accessibility?", options: ["2:1","3:1","4.5:1","7:1"], correct: 2, skill: "Accessibility" },
  // Stage 3
  { id: 'q86', stage: 3, career: 'ui-ux-designer', question: "What is an affinity diagram used for in UX?", options: ["Creating prototypes","Organizing research findings into themes","Designing components","Testing performance"], correct: 1, skill: "User Research" },
  { id: 'q87', stage: 3, career: 'ui-ux-designer', question: "What is the Gestalt principle of proximity?", options: ["Objects of similar color belong together","Elements close together are perceived as related","The eye follows lines","Symmetry creates balance"], correct: 1, skill: "Design Principles" },
  { id: 'q88', stage: 3, career: 'ui-ux-designer', question: "What is a heatmap in UX research?", options: ["A color palette tool","A visual representation of where users click or look on a page","A prototyping technique","A grid system"], correct: 1, skill: "Usability Testing" },
  { id: 'q89', stage: 3, career: 'ui-ux-designer', question: "What is the purpose of card sorting?", options: ["Sorting color cards","Organizing content based on user mental models","Prioritizing features","Testing navigation speed"], correct: 1, skill: "User Research" },
  { id: 'q90', stage: 3, career: 'ui-ux-designer', question: "What is responsive design?", options: ["Design that responds to user feedback","Design that adapts to different screen sizes","Design with animations","Design with user controls"], correct: 1, skill: "Design Principles" }
];

export const questions = [...coreQuestions, ...extraQuestions];
