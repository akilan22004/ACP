import React, { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowDownRight,
  ArrowRight,
  BarChart3,
  BookOpen,
  Briefcase,
  CircleUserRound,
  Code2,
  Mic2,
  Menu,
  Palette,
  Play,
  Search,
  Sparkles,
  Target,
  X,
} from 'lucide-react';
import { careers } from '../data/careers';

const careerPresentation = {
  'java-full-stack': {
    summary: 'Build applications with Java and Spring Boot',
    image: '/images/home-reference/career-full-stack.png',
    icon: Code2,
    tone: 'blue',
    isFullCard: true,
  },
  'data-analyst': {
    summary: 'Turn data into clear business insights',
    image: '/images/home-reference/career-data-analyst.png',
    icon: BarChart3,
    tone: 'yellow',
    isFullCard: true,
  },
  'data-scientist': {
    summary: 'Create predictive models with machine learning',
    image: '/images/home-reference/career-data-scientist.png',
    icon: Sparkles,
    tone: 'mint',
    isFullCard: true,
  },
  'business-analyst': {
    summary: 'Connect business needs with technology',
    image: '/images/home-reference/career-business-analyst.png',
    icon: Briefcase,
    tone: 'peach',
    isFullCard: true,
  },
  'qa-tester': {
    summary: 'Test software quality, manually and with automation',
    image: '/images/careers/qa-tester.svg',
    icon: Target,
    tone: 'pink',
  },
  'ui-ux-designer': {
    summary: 'Design intuitive digital experiences',
    image: '/images/home-reference/career-ui-ux.png',
    icon: Palette,
    tone: 'lavender',
    isFullCard: true,
  },
};

const baseCareerPaths = careers.map((career) => ({
  ...career,
  ...careerPresentation[career.id],
}));

const aiMlCareer = {
  id: 'ai-ml-engineer',
  title: 'AI/ML Engineer',
  description: 'Work with artificial intelligence',
  summary: 'Work with artificial intelligence',
  image: '/images/home-reference/career-ai-ml.png',
  icon: Sparkles,
  tone: 'lavender',
  isFullCard: true,
};

const careerPaths = [...baseCareerPaths, aiMlCareer];
const featuredCareerIds = [
  'java-full-stack',
  'data-scientist',
  'data-analyst',
  'ui-ux-designer',
  'business-analyst',
  'ai-ml-engineer',
];
const featuredCareerPaths = featuredCareerIds.map((id) =>
  careerPaths.find((career) => career.id === id),
);

const careerTools = [
  { label: 'Skills', image: '/images/home-reference/skills-tile.png', className: 'landing-tool-skills' },
  { label: 'Interview', icon: Mic2, className: 'landing-tool-interview' },
  { label: 'Assessment', icon: Target, className: 'landing-tool-assessment' },
  { label: 'Jobs', image: '/images/home-reference/jobs-tile.png', className: 'landing-tool-jobs' },
  { label: 'Certificates', image: '/images/home-reference/certificates-tile.png', className: 'landing-tool-certificates' },
];

const benefits = [
  {
    title: 'Learn',
    description: 'Build practical skills with focused courses and resources.',
    icon: BookOpen,
    tone: 'blue',
  },
  {
    title: 'Practice',
    description: 'Try assessments and mock interviews in a safe space.',
    icon: Target,
    tone: 'pink',
  },
  {
    title: 'Improve',
    description: 'Get feedback that helps you choose your next step.',
    icon: BarChart3,
    tone: 'mint',
  },
  {
    title: 'Get hired',
    description: 'Prepare for real-world roles with confidence.',
    icon: Briefcase,
    tone: 'yellow',
  },
];

export default function Landing() {
  const [careerSearch, setCareerSearch] = useState('');
  const [isNavigationOpen, setIsNavigationOpen] = useState(false);
  const navigationToggleRef = useRef(null);
  const filteredCareerPaths = useMemo(() => {
    const query = careerSearch.trim().toLocaleLowerCase();
    if (!query) return featuredCareerPaths;
    return careerPaths.filter(({ title, description }) =>
      `${title} ${description}`.toLocaleLowerCase().includes(query),
    );
  }, [careerSearch]);

  return (
    <div className="career-light-page landing-page">
      <header
        className="landing-header"
        data-nav-open={isNavigationOpen}
        onKeyDown={(event) => {
          if (event.key === 'Escape' && isNavigationOpen) {
            setIsNavigationOpen(false);
            navigationToggleRef.current?.focus();
          }
        }}
      >
        <Link to="/" className="landing-brand" aria-label="CareerAI home" onClick={() => setIsNavigationOpen(false)}>
          <img className="careerai-brand-logo" src="/images/careerai-logo.png" alt="CareerAI" />
        </Link>

        <button
          ref={navigationToggleRef}
          className="landing-nav-toggle"
          type="button"
          aria-label={isNavigationOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={isNavigationOpen}
          aria-controls="landing-site-navigation"
          onClick={() => setIsNavigationOpen((open) => !open)}
        >
          {isNavigationOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <nav className="landing-nav" id="landing-site-navigation" aria-label="Main navigation">
          <a className="is-active" href="#home" onClick={() => setIsNavigationOpen(false)}>Home</a>
          <a href="#career-paths" onClick={() => setIsNavigationOpen(false)}>Careers</a>
          <Link to="/learning" onClick={() => setIsNavigationOpen(false)}>Learning</Link>
          <Link to="/assessment" onClick={() => setIsNavigationOpen(false)}>Assessment</Link>
          <Link to="/mock-interview" onClick={() => setIsNavigationOpen(false)}>Interview</Link>
          <Link to="/jobs" onClick={() => setIsNavigationOpen(false)}>Jobs</Link>
          <a href="#about" onClick={() => setIsNavigationOpen(false)}>About</a>
        </nav>

        <div className="landing-header-actions">
          <label className="landing-search">
            <Search size={15} aria-hidden="true" />
            <input
              aria-label="Search career paths"
              type="search"
              placeholder="Search careers..."
              value={careerSearch}
              onChange={(event) => {
                const nextQuery = event.target.value;
                setCareerSearch(nextQuery);
                if (!careerSearch.trim() && nextQuery.trim()) {
                  window.requestAnimationFrame(() => {
                    document.getElementById('career-paths')?.scrollIntoView({
                      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
                      block: 'start',
                    });
                  });
                }
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && careerSearch.trim()) {
                  document.getElementById('career-paths')?.scrollIntoView({
                    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
                  });
                }
              }}
            />
          </label>
          <Link to="/login" className="landing-login-link" aria-label="Sign in to your account">
            <CircleUserRound size={23} aria-hidden="true" />
            <span>Sign in</span>
          </Link>
          <Link to="/register" className="landing-header-cta">
            <span className="landing-cta-desktop">Get started</span>
            <span className="landing-cta-mobile">Join</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </header>

      <main>
        <section className="landing-hero" id="home">
          <div className="landing-hero-copy">
            <div className="landing-eyebrow">
              <span className="landing-learner-dots" aria-hidden="true">
                <span>J</span><span>M</span><span>A</span>
              </span>
              <span>Made for your next chapter</span>
            </div>

            <h1 className="landing-title landing-title-image">
              <img src="/images/home-reference/hero-headline.png" alt="Build your dream career with AI" />
            </h1>

            <p className="landing-description">
              Learn in-demand skills, take AI-powered assessments, practice real interviews, and become job ready.
            </p>

            <div className="landing-actions">
              <Link to="/register" className="landing-primary-cta">Get started <ArrowRight size={17} /></Link>
              <a className="landing-secondary-cta" href="#about">
                <span className="landing-play-icon"><Play size={13} fill="currentColor" /></span>
                Explore how it works
              </a>
            </div>

            <a href="#career-paths" className="landing-note">
              <ArrowDownRight size={22} aria-hidden="true" />
              <span>Let’s build your future together!</span>
            </a>
          </div>

          <div className="landing-illustration" aria-label="A learner exploring career skills">
            <img
              className="landing-hero-character"
              src="/images/scenes/hero-career-student.png"
              alt="A student learning with a laptop"
              loading="eager"
            />
            <img className="landing-hero-books" src="/images/home-reference/books-plant.png" alt="" />
            {careerTools.map(({ label, icon: Icon, image, className }) => (
              <div className={`landing-tool ${className}${image ? ' has-art' : ''}`} key={label}>
                {image ? (
                  <img src={image} alt={label} />
                ) : (
                  <>
                    <span><Icon size={25} strokeWidth={2.5} /></span>
                    <strong>{label}</strong>
                  </>
                )}
              </div>
            ))}
            <img
              className="landing-doodle-image"
              src="/images/home-reference/learning-callout.png"
              alt=""
              aria-hidden="true"
            />
          </div>
        </section>

        <section className="landing-career-section" id="career-paths" aria-labelledby="landing-career-title">
          <div className="landing-career-intro">
            <span className="landing-section-kicker">Explore opportunities</span>
            <h2 id="landing-career-title">Choose Your<br />Career Path<span className="landing-sparkle">✳</span></h2>
            <p>Discover in-demand careers and get a personalized learning path to achieve your goals.</p>
            <Link to="/careers" className="landing-outline-link">Explore all careers <ArrowRight size={15} /></Link>
          </div>
          <div className={`landing-career-list${careerSearch.trim() ? ' is-filtered' : ''}`} aria-live="polite">
            {filteredCareerPaths.map(({ id, title, description, summary, image, icon: Icon, tone, isFullCard }) => (
              <Link
                to="/careers"
                className={`landing-career-card tone-${tone}${isFullCard ? ' is-full-art' : ''}`}
                key={id}
                aria-label={`${title}: ${description}`}
              >
                {isFullCard ? (
                  <img className="landing-career-full-image" src={image} alt="" loading="eager" />
                ) : (
                  <>
                    <div className="landing-career-art">
                      <img src={image} alt="" loading="eager" />
                      <span className="landing-career-icon"><Icon size={18} /></span>
                    </div>
                    <div className="landing-career-copy">
                      <h3>{title}</h3>
                      <p>{summary}</p>
                    </div>
                    <span className="landing-career-arrow" aria-hidden="true"><ArrowRight size={16} /></span>
                  </>
                )}
              </Link>
            ))}
            {filteredCareerPaths.length === 0 && (
              <p className="landing-search-empty" role="status">
                No career paths match “{careerSearch}”. Try another search.
              </p>
            )}
          </div>
        </section>

        <section className="landing-trust-strip" aria-label="Career readiness tools">
          <div className="landing-trust-topline">
            <span className="landing-trust-label">A practical path from learning to work readiness</span>
            <div className="landing-trust-brands" aria-hidden="true">
              <span>Google</span><span>Microsoft</span><span>amazon</span><span>IBM</span>
              <span>Meta</span><span>tcs</span><span>accenture</span><span>Infosys</span>
            </div>
          </div>
          <div className="landing-logo-marquee" role="region" aria-label="Company wordmarks" tabIndex={0}>
            <div className="landing-logo-track">
              <div className="landing-logo-set">
                <span className="landing-logo landing-logo-google" role="img" aria-label="Google">
                  <span aria-hidden="true"><i>G</i><i>o</i><i>o</i><i>g</i><i>l</i><i>e</i></span>
                </span>
                <span className="landing-logo landing-logo-microsoft" role="img" aria-label="Microsoft">
                  <span className="landing-microsoft-mark" aria-hidden="true"><i /><i /><i /><i /></span>
                  <span aria-hidden="true">Microsoft</span>
                </span>
                <span className="landing-logo landing-logo-amazon" role="img" aria-label="Amazon">
                  <span aria-hidden="true">amazon</span>
                  <i aria-hidden="true" />
                </span>
                <span className="landing-logo landing-logo-ibm" role="img" aria-label="IBM">IBM</span>
                <span className="landing-logo landing-logo-meta" role="img" aria-label="Meta">
                  <i aria-hidden="true">∞</i><span aria-hidden="true">Meta</span>
                </span>
                <span className="landing-logo landing-logo-tcs" role="img" aria-label="TCS">TCS</span>
                <span className="landing-logo landing-logo-accenture" role="img" aria-label="Accenture">
                  <i aria-hidden="true">&gt;</i><span aria-hidden="true">accenture</span>
                </span>
                <span className="landing-logo landing-logo-infosys" role="img" aria-label="Infosys">Infosys</span>
              </div>
              <div className="landing-logo-set" aria-hidden="true">
                <span className="landing-logo landing-logo-google">
                  <span><i>G</i><i>o</i><i>o</i><i>g</i><i>l</i><i>e</i></span>
                </span>
                <span className="landing-logo landing-logo-microsoft">
                  <span className="landing-microsoft-mark"><i /><i /><i /><i /></span>
                  <span>Microsoft</span>
                </span>
                <span className="landing-logo landing-logo-amazon">
                  <span>amazon</span><i />
                </span>
                <span className="landing-logo landing-logo-ibm">IBM</span>
                <span className="landing-logo landing-logo-meta"><i>∞</i><span>Meta</span></span>
                <span className="landing-logo landing-logo-tcs">TCS</span>
                <span className="landing-logo landing-logo-accenture"><i>&gt;</i><span>accenture</span></span>
                <span className="landing-logo landing-logo-infosys">Infosys</span>
              </div>
            </div>
          </div>
          <div className="landing-company-track">
            <div className="landing-company-flow">
              <div className="landing-company-names">
                <Link to="/learning">Learn</Link>
                <Link to="/assessment">Assess</Link>
                <Link to="/mock-interview">Practice interviews</Link>
                <Link to="/jobs">Explore jobs</Link>
              </div>
              <div className="landing-company-names is-decorative" aria-hidden="true">
                <Link to="/learning" tabIndex={-1}>Learn</Link>
                <Link to="/assessment" tabIndex={-1}>Assess</Link>
                <Link to="/mock-interview" tabIndex={-1}>Practice interviews</Link>
                <Link to="/jobs" tabIndex={-1}>Explore jobs</Link>
              </div>
            </div>
          </div>
        </section>

        <section className="landing-why-section" id="about" aria-labelledby="landing-why-title">
          <div className="landing-why-art">
            <img src="/images/home-reference/learner-cutout.png" alt="A learner building skills for a brighter future" />
            <div className="landing-why-note"><Sparkles size={18} /> A brighter future starts here!</div>
          </div>
          <div className="landing-why-copy">
            <span className="landing-section-kicker">Why CareerAI</span>
            <h2 id="landing-why-title">Everything You Need<br />to <span>Grow</span> Your Career</h2>
            <p>From learning to job readiness, find a clear, practical way to move forward.</p>
            <div className="landing-benefits">
              {benefits.map(({ title, description, icon: Icon, tone }) => (
                <article className={`landing-benefit tone-${tone}`} key={title}>
                  <span className="landing-benefit-icon"><Icon size={20} strokeWidth={2.4} /></span>
                  <div>
                    <h3>{title}</h3>
                    <p>{description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <p>&copy; {new Date().getFullYear()} CareerAI. Learn with purpose. Grow with confidence.</p>
        <Link to="/login">Your workspace <ArrowRight size={14} /></Link>
      </footer>
    </div>
  );
}
