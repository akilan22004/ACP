import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { careers } from '../data/careers';
import { useCareer } from '../context/CareerContext';
import { ArrowRight, BarChart2, Briefcase, Check, CheckCircle, Code, Search, Target, TrendingUp } from 'lucide-react';
import { getLearningLevel } from '../data/learning';
import { getLearningTopicProgress } from '../utils/learning';
import { topicProgressStats } from '../data/roadmaps';

const careerCategories = {
  'java-full-stack': 'Development',
  'cloud-engineering': 'Development',
  'devops': 'Development',
  'data-analyst': 'Data',
  'data-scientist': 'Data',
  'business-analyst': 'Business',
  'ui-ux-designer': 'Design',
  'qa-tester': 'Others'
};

const categoryFilters = ['All', 'Development', 'Data', 'Business', 'Design', 'Others'];

const careerVisuals = {
  'java-full-stack': { icon: Code, visual: 'career-visual-code', label: 'Full-stack systems', image: '/images/careers/java-full-stack.svg' },
  'cloud-engineering': { icon: Code, visual: 'career-visual-code', label: 'Cloud infrastructure', image: '/images/careers/cloud-engineering-card.png' },
  'devops': { icon: Code, visual: 'career-visual-code', label: 'CI/CD automation', image: '/images/careers/devops-card.png' },
  'data-analyst': { icon: BarChart2, visual: 'career-visual-analytics', label: 'Data & insights', image: '/images/careers/data-analyst.svg' },
  'data-scientist': { icon: TrendingUp, visual: 'career-visual-science', label: 'Models & patterns', image: '/images/careers/data-scientist.svg' },
  'business-analyst': { icon: Briefcase, visual: 'career-visual-business', label: 'Process & outcomes', image: '/images/careers/business-analyst.svg' },
  'qa-tester': { icon: CheckCircle, visual: 'career-visual-testing', label: 'Quality engineering', image: '/images/careers/qa-tester.svg' },
  'ui-ux-designer': { icon: Target, visual: 'career-visual-design', label: 'People-first design', image: '/images/careers/ui-ux-designer.svg' }
};

const cardAvatars = {
  'java-full-stack': '/images/careers/full-stack-card.png',
  'cloud-engineering': '/images/careers/cloud-engineering-card.png',
  'devops': '/images/careers/devops-card.png',
  'data-analyst': '/images/careers/data-analyst-card.png',
  'data-scientist': '/images/careers/data-scientist-card.png',
  'business-analyst': '/images/careers/business-analyst-card.png',
  'qa-tester': '/images/careers/qa-tester-card.png',
  'ui-ux-designer': '/images/careers/ui-ux-card.png',
};

export default function Careers() {
  const {
    selectedCareer, selectCareer, learningProgress, roadmapProgress,
    learningJourney = {}, progressReady
  } = useCareer();
  const navigate = useNavigate();
  const [confirmModal, setConfirmModal] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredCareers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return careers.filter(career => {
      const matchesCategory = activeCategory === 'All' || careerCategories[career.id] === activeCategory;
      const matchesSearch = !query || `${career.title} ${career.description}`.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const handleSelect = (career) => {
    if (selectedCareer?.id === career.id) {
      navigate('/learning');
      return;
    }
    if (selectedCareer && selectedCareer.id !== career.id) {
      setConfirmModal(career);
    } else {
      selectCareer(career);
      navigate('/learning');
    }
  };

  const confirmChange = () => {
    selectCareer(confirmModal);
    navigate('/learning');
  };

  return (
    <div className="career-selection-page" style={{
      backgroundImage: "url('/images/careers/careers-page-background.png')",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
      <header className="career-selection-hero">
        <div className="career-selection-hero-copy">
          <p className="career-selection-eyebrow">Find your direction</p>
          <h1 className="career-selection-title">Choose Your Career <span>Path</span></h1>
          <p className="career-selection-description">Discover in-demand careers and get a personalized learning path to achieve your goals.</p>
          <label className="career-search">
            <Search size={19} aria-hidden="true" />
            <span className="sr-only">Search career titles and descriptions</span>
            <input
              type="search"
              value={searchQuery}
              onChange={event => setSearchQuery(event.target.value)}
              placeholder="Search careers..."
            />
          </label>
          <div className="career-category-filters" role="group" aria-label="Filter careers by category">
            {categoryFilters.map(category => (
              <button
                key={category}
                type="button"
                className={`career-category-filter ${activeCategory === category ? 'is-active' : ''}`}
                aria-pressed={activeCategory === category}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
        <div className="career-selection-hero-art" aria-hidden="true">
          <span className="career-hero-sun" />
          <span className="career-hero-cloud career-hero-cloud-one" />
          <span className="career-hero-cloud career-hero-cloud-two" />
          <span className="career-hero-note">Find your passion!</span>
          <img src="/images/scenes/career-path-girl.png" alt="" />
        </div>
      </header>

      <section className="career-results" aria-label="Career paths">
        <div className="career-results-heading">
          <div>
            <p className="career-results-eyebrow">Explore your options</p>
            <h2>Career paths</h2>
          </div>
          <span>{filteredCareers.length} {filteredCareers.length === 1 ? 'path' : 'paths'}</span>
        </div>
        {filteredCareers.length > 0 ? (
          <div className="career-path-grid">
        {filteredCareers.map(career => {
          const isSelected = selectedCareer?.id === career.id;
          const visual = careerVisuals[career.id] || { icon: Briefcase, visual: 'career-visual-default', label: 'Career path', image: null };
          const VisualIcon = visual.icon;
          const careerProgress = isSelected && progressReady
            ? career.topics.reduce((total, topic) => {
                const oldStats = topicProgressStats(topic.name, roadmapProgress[topic.id] || {});
                const progress = getLearningTopicProgress(topic.id, learningJourney, oldStats.percent, oldStats.complete || !!learningProgress[topic.id], career.id);
                return total + progress.percent;
              }, 0)
            : 0;
          const progressPercent = isSelected && career.topics.length ? Math.round(careerProgress / career.topics.length) : null;
          const level = career.topics.length
            ? [...career.topics.map((topic) => getLearningLevel(topic.name))].sort((a, b) => ['Beginner', 'Intermediate', 'Advanced'].indexOf(a) - ['Beginner', 'Intermediate', 'Advanced'].indexOf(b))[0]
            : null;
          return (
            <article key={career.id} className={`career-path-card ${isSelected ? 'is-selected' : ''}`}>
              <div className={`career-path-art ${visual.visual}`}>
                {cardAvatars[career.id] ? (
                  <img className={`career-path-image career-path-image-${career.id}`} src={cardAvatars[career.id]} alt={`${career.title} career illustration`} loading="lazy" />
                ) : (
                  visual.image && <img className={`career-path-image career-path-image-${career.id}`} src={visual.image} alt={`${career.title} career illustration`} loading="lazy" />
                )}
                <div className="career-path-art-grid" aria-hidden="true" />
                <span className="career-path-symbol"><VisualIcon size={30} /></span>
                <span className="career-path-art-caption">{careerCategories[career.id]} · {visual.label}</span>
                {isSelected && <span className="career-selected-label"><Check size={13} /> Your current path</span>}
              </div>
              <div className="career-path-body">
                <div className="career-path-title-row"><h3>{career.title}</h3><span className="career-level-label">{level} entry</span></div>
                <p className="career-path-description">{career.description}</p>
                <div className="career-skill-list">
                {career.topics.slice(0, 4).map(topic => (
                  <span key={topic.id} className="career-skill-chip">
                    {topic.name}
                  </span>
                ))}
                {career.topics.length > 4 && (
                  <span className="career-skill-chip is-more">
                    +{career.topics.length - 4} skills
                  </span>
                )}
              </div>
                {progressPercent !== null && <div className="career-path-progress"><div><span>Learning progress</span><span>{progressPercent}%</span></div><div className="learning-overall-track"><span style={{ width: `${progressPercent}%` }} /></div></div>}
                <div className="career-card-actions">
                  <button onClick={() => handleSelect(career)} className={`career-select-button ${isSelected ? 'is-selected' : ''}`}>
                  {isSelected ? <><Check size={16} /> Continue this path</> : <>Explore this career <ArrowRight size={16} /></>}
                </button>
                <Link to={`/careers/${career.id}`} className="career-card-details-link">View details</Link>
                </div>
              </div>
            </article>
          );
        })}
          </div>
        ) : (
          <div className="career-empty-state" role="status">
            <Search size={22} aria-hidden="true" />
            <h3>No career paths found</h3>
            <p>Try another search or choose a different category.</p>
            <button type="button" onClick={() => { setSearchQuery(''); setActiveCategory('All'); }}>Clear filters</button>
          </div>
        )}
      </section>

      {confirmModal && (
        <div className="career-change-overlay">
          <div className="career-change-dialog" role="dialog" aria-modal="true" aria-labelledby="career-change-title">
            <h3 id="career-change-title">Change Career Path?</h3>
            <p>
              Switching from <strong>{selectedCareer.title}</strong> to <strong>{confirmModal.title}</strong> will reset all your current assessment progress and skill scores. Are you sure?
            </p>
            <div className="career-change-actions">
              <button
                onClick={() => setConfirmModal(null)}
                className="career-change-cancel"
              >
                Cancel
              </button>
              <button
                onClick={confirmChange}
                className="career-change-confirm"
              >
                Yes, Switch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
