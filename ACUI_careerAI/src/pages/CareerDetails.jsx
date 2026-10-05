import React, { useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BarChart2, BookOpen, Briefcase, Check, Code, Globe, Sparkles, TrendingUp } from 'lucide-react';
import { careers } from '../data/careers';
import { useCareer } from '../context/CareerContext';
import { getRoadmap } from '../data/roadmaps';

const careerTemplate = {
  'java-full-stack': {
    headline: 'Full Stack Developer',
    summary: 'Build modern web applications using frontend and backend technologies.',
    salaryRange: '$70K - $120K / year',
    jobGrowth: 22,
    checklist: [
      'Develop and maintain web applications',
      'Work with frontend and backend technologies',
      'Build real-world projects',
      'High demand in global job market'
    ],
    visual: '/images/scenes/cheerful-student-laptop.png',
    icon: Code,
    badgeLabel: 'High Demand'
  },
  'cloud-engineering': {
    headline: 'Cloud Engineer',
    summary: 'Design resilient cloud systems, automate infrastructure, and scale modern applications.',
    salaryRange: '$85K - $140K / year',
    jobGrowth: 25,
    checklist: [
      'Deploy and manage cloud infrastructure',
      'Automate provisioning and scaling',
      'Build reliable distributed systems',
      'Support secure cloud-native solutions'
    ],
    visual: '/images/careers/cloud-engineering-card.png',
    icon: Globe,
    badgeLabel: 'Cloud Native'
  },
  'devops': {
    headline: 'DevOps Engineer',
    summary: 'Improve system reliability by automating delivery, monitoring, and operational workflows.',
    salaryRange: '$80K - $135K / year',
    jobGrowth: 24,
    checklist: [
      'Build and manage CI/CD pipelines',
      'Monitor, deploy, and troubleshoot systems',
      'Automate infrastructure and release tasks',
      'Improve uptime and software quality'
    ],
    visual: '/images/careers/devops-card.png',
    icon: Globe,
    badgeLabel: 'Automation Focus'
  },
  'data-analyst': {
    headline: 'Data Analyst',
    summary: 'Turn data into clear insights and business decisions.',
    salaryRange: '$65K - $110K / year',
    jobGrowth: 20,
    checklist: [
      'Analyze business data and trends',
      'Create dashboards and reports',
      'Translate data into action',
      'Strong demand across industries'
    ],
    visual: '/images/careers/data-analyst-card.png',
    icon: BarChart2,
    badgeLabel: 'Insight Driven'
  },
  'data-scientist': {
    headline: 'Data Scientist',
    summary: 'Build predictive models and turn data into meaningful intelligence.',
    salaryRange: '$90K - $150K / year',
    jobGrowth: 26,
    checklist: [
      'Design machine learning models',
      'Clean, process, and analyze data',
      'Communicate insights effectively',
      'Solve complex business problems'
    ],
    visual: '/images/careers/data-scientist-card.png',
    icon: TrendingUp,
    badgeLabel: 'AI Ready'
  },
  'business-analyst': {
    headline: 'Business Analyst',
    summary: 'Bridge business goals and technology with clear strategy.',
    salaryRange: '$75K - $125K / year',
    jobGrowth: 18,
    checklist: [
      'Gather and document requirements',
      'Align teams around business goals',
      'Improve processes and reporting',
      'Support delivery and optimization'
    ],
    visual: '/images/careers/business-analyst-card.png',
    icon: Briefcase,
    badgeLabel: 'Business Focus'
  },
  'qa-tester': {
    headline: 'QA / Software Tester',
    summary: 'Ensure software quality through thoughtful testing and validation.',
    salaryRange: '$55K - $95K / year',
    jobGrowth: 17,
    checklist: [
      'Design and execute test cases',
      'Validate functionality and performance',
      'Catch bugs before release',
      'Support product quality and trust'
    ],
    visual: '/images/careers/qa-tester-card.png',
    icon: Check,
    badgeLabel: 'Quality First'
  },
  'ui-ux-designer': {
    headline: 'UI/UX Designer',
    summary: 'Create engaging digital experiences that delight users.',
    salaryRange: '$60K - $110K / year',
    jobGrowth: 19,
    checklist: [
      'Design intuitive interfaces',
      'Research user needs and behaviors',
      'Create wireframes and prototypes',
      'Improve product usability'
    ],
    visual: '/images/careers/ui-ux-card.png',
    icon: Sparkles,
    badgeLabel: 'Creative Impact'
  }
};

export default function CareerDetails() {
  const { careerId } = useParams();
  const { selectedCareer, selectCareer } = useCareer();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Overview');
  const [pendingSwitch, setPendingSwitch] = useState(false);

  const career = careers.find((item) => item.id === careerId) || null;

  if (!career || !careerTemplate[career.id]) {
    return <Navigate to="/careers" replace />;
  }

  const template = careerTemplate[career.id];
  const headline = template.headline;
  const summary = template.summary;
  const benefitCards = [
    { title: 'Learn In-Demand Skills', description: 'Frontend, Backend, Databases and more', tone: 'sky' },
    { title: 'Build Real Projects', description: 'Create portfolio with real-world applications', tone: 'mint' },
    { title: 'Get Job Ready', description: 'Interview preparation and industry insights', tone: 'purple' },
    { title: 'Global Opportunities', description: 'Work remotely or on-site worldwide', tone: 'amber' }
  ];

  const checklist = template.checklist;

  const resources = career.topics.slice(0, 4).map((topic) => {
    const roadmap = getRoadmap(topic.name);
    const firstResource = roadmap.youtube?.[0] ?? roadmap.reading?.[0];

    if (!firstResource) {
      return null;
    }

    return {
      title: firstResource.title,
      url: firstResource.url,
      source: firstResource.url.includes('youtube.com') ? 'Video' : 'Guide'
    };
  }).filter(Boolean).slice(0, 4);

  const handleStartLearning = () => {
    if (selectedCareer?.id === career.id) {
      navigate('/learning');
      return;
    }

    if (selectedCareer && selectedCareer.id !== career.id) {
      setPendingSwitch(true);
      return;
    }

    selectCareer(career);
    navigate('/learning');
  };

  const confirmSwitchCareer = () => {
    selectCareer(career);
    setPendingSwitch(false);
    navigate('/learning');
  };

  const tabs = ['Overview', 'Learning Path', 'Skills', 'Jobs', 'Resources'];

  const handleTabClick = (tab) => {
    if (tab === 'Learning Path') {
      handleStartLearning();
      return;
    }

    if (tab === 'Jobs') {
      navigate('/jobs');
      return;
    }

    setActiveTab(tab);
  };

  return (
    <div className="career-detail-page">
      <div className="career-detail-surface">
        <header className="career-detail-hero">
          <div className="career-detail-hero-copy">
            <Link to="/careers" className="career-detail-back-link">
              <ArrowLeft size={18} />
              <span>Back to Careers</span>
            </Link>

            <div className="career-detail-hero-main">
              <div className="career-detail-hero-icon" aria-hidden="true">
                {template.icon ? React.createElement(template.icon, { size: 34 }) : <Code size={34} />}
              </div>
              <h1>{headline}</h1>
            </div>

            <p className="career-detail-description">{summary}</p>

            <div className="career-detail-badges" aria-label="Career highlights">
              <span className="career-detail-badge career-detail-badge-orange">{template.badgeLabel}</span>
              <span className="career-detail-badge career-detail-badge-green">Good Salary</span>
              <span className="career-detail-badge career-detail-badge-blue">Global Opportunities</span>
            </div>
          </div>

          <div className="career-detail-visual" aria-hidden="true">
            <span className="career-detail-visual-orb" />
            <span className="career-detail-visual-card career-detail-visual-card-one" />
            <span className="career-detail-visual-card career-detail-visual-card-two" />
            <img src={template.visual} alt="" loading="eager" />
          </div>
        </header>

        <div className="career-detail-tabs" role="tablist" aria-label="Career detail tabs">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={activeTab === tab}
              className={`career-detail-tab ${activeTab === tab ? 'is-active' : ''}`}
              onClick={() => handleTabClick(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'Overview' && (
          <section className="career-detail-overview">
            <div className="career-detail-about-panel">
              <h2>About This Career</h2>
              <p>
                {career.title} roles focus on building expertise in the skills and workflows that matter most for this path.
                They combine practical problem solving with industry tools and real-world project experience.
              </p>

              <ul className="career-detail-checklist">
                {checklist.map((item) => (
                  <li key={item}><Check size={16} /> <span>{item}</span></li>
                ))}
              </ul>
            </div>

            <div className="career-detail-metrics-panel">
              <div className="career-detail-metric-card">
                <span>Average Salary</span>
                <strong>{template.salaryRange}</strong>
              </div>
              <div className="career-detail-metric-card">
                <span>Job Growth</span>
                <strong>{template.jobGrowth}%</strong>
                <small>Faster than average</small>
              </div>

              <button type="button" className="career-detail-primary-button" onClick={handleStartLearning}>
                Start Learning Path
                <ArrowRight size={18} />
              </button>
            </div>
          </section>
        )}

        {activeTab === 'Resources' && (
          <section className="career-detail-panel">
            <div className="career-detail-panel-header">
              <h3>Recommended resources</h3>
              <span>Learning resources from existing roadmap data</span>
            </div>
            <div className="career-detail-resource-grid">
              {resources.map((item) => (
                <a key={`${item.title}-${item.source}`} href={item.url} target="_blank" rel="noreferrer" className="career-detail-resource-card">
                  <span className="career-detail-resource-tag">{item.source}</span>
                  <strong>{item.title}</strong>
                  <span>Explore resource</span>
                </a>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'Skills' && (
          <section className="career-detail-panel">
            <div className="career-detail-panel-header">
              <h3>Core skill stack</h3>
              <span>Topics in the current pathway</span>
            </div>
            <div className="career-detail-skill-grid">
              {career.topics.map((topic) => (
                <div key={topic.id} className="career-detail-skill-pill">{topic.name}</div>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'Jobs' && (
          <section className="career-detail-panel">
            <div className="career-detail-panel-header">
              <h3>Job search</h3>
              <span>Use the existing jobs board</span>
            </div>
            <div className="career-detail-empty-state">
              <Sparkles size={20} />
              <p>Open the existing jobs center to explore roles for {career.title}.</p>
              <button type="button" className="career-detail-secondary-button" onClick={() => navigate('/jobs')}>
                Open Jobs Board
              </button>
            </div>
          </section>
        )}

        <section className="career-detail-benefits">
          {benefitCards.map((benefit) => (
            <article key={benefit.title} className={`career-detail-benefit-card career-detail-benefit-card-${benefit.tone}`}>
              <div className="career-detail-benefit-icon" aria-hidden="true">
                {benefit.title === 'Learn In-Demand Skills' && <BookOpen size={20} />}
                {benefit.title === 'Build Real Projects' && <Briefcase size={20} />}
                {benefit.title === 'Get Job Ready' && <Sparkles size={20} />}
                {benefit.title === 'Global Opportunities' && <Globe size={20} />}
              </div>
              <h3>{benefit.title}</h3>
              <p>{benefit.description}</p>
            </article>
          ))}
        </section>
      </div>

      {pendingSwitch && (
        <div className="career-detail-switch-overlay">
          <div className="career-detail-switch-dialog" role="dialog" aria-modal="true" aria-labelledby="career-switch-title">
            <h3 id="career-switch-title">Switch Career Path?</h3>
            <p>
              Switching from <strong>{selectedCareer.title}</strong> to <strong>{career.title}</strong> will reset your current assessment progress and skill scores. Continue?
            </p>
            <div className="career-detail-switch-actions">
              <button type="button" className="career-detail-switch-cancel" onClick={() => setPendingSwitch(false)}>
                Cancel
              </button>
              <button type="button" className="career-detail-switch-confirm" onClick={confirmSwitchCareer}>
                Yes, Switch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
