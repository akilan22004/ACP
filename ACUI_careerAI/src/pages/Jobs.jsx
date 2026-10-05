import React, { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useCareer } from '../context/CareerContext';
import { Search, MapPin, ExternalLink, Briefcase, Lock, ArrowRight, Compass, Globe2 } from 'lucide-react';

export default function Jobs() {
  const { selectedCareer, jobsUnlocked } = useCareer();
  const [location, setLocation] = useState('Chennai');

  if (!selectedCareer) return <Navigate to="/careers" replace />;

  if (!jobsUnlocked) {
    return (
      <main className="jobs-page">
        <section className="jobs-locked-state" aria-labelledby="jobs-locked-title">
          <span className="jobs-locked-icon" aria-hidden="true"><Lock size={23} /></span>
          <p className="jobs-kicker">Career milestone</p>
          <h1 id="jobs-locked-title">Job search is locked</h1>
          <p className="jobs-locked-copy">
            Job search unlocks only after you pass the mock interview and issue your Digital Skill Passport.
          </p>
          <Link to="/dashboard" className="jobs-return-link">
            Return to dashboard <ArrowRight size={16} />
          </Link>
        </section>
      </main>
    );
  }

  const searchLocation = location.trim();
  const jobQuery = `${selectedCareer.title} jobs in ${searchLocation}`;
  const encodedQuery = encodeURIComponent(jobQuery);
  const locationSlug = searchLocation.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const roleSlug = selectedCareer.title.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const portals = [
    {
      name: 'LinkedIn',
      source: 'Professional network',
      description: 'Search role listings and company pages.',
      url: `https://www.linkedin.com/jobs/search/?keywords=${encodedQuery}`,
      visual: 'jobs-linkedin',
      mark: 'in'
    },
    {
      name: 'Indeed',
      source: 'Job search engine',
      description: 'Browse role listings by location.',
      url: `https://in.indeed.com/jobs?q=${encodeURIComponent(selectedCareer.title)}&l=${encodeURIComponent(searchLocation)}`,
      visual: 'jobs-indeed',
      mark: 'i'
    },
    {
      name: 'Naukri',
      source: 'India job portal',
      description: 'Explore postings on Naukri.',
      url: `https://www.naukri.com/${roleSlug}-jobs-in-${locationSlug}`,
      visual: 'jobs-naukri',
      mark: 'N'
    },
    {
      name: 'Google Jobs',
      source: 'Web search',
      description: 'See job listings indexed by Google.',
      url: `https://www.google.com/search?q=${encodedQuery}&ibp=htl;jobs`,
      visual: 'jobs-google',
      mark: 'G'
    }
  ];
  const hasLocation = Boolean(searchLocation);

  return (
    <main className="jobs-page">
      <header className="jobs-heading">
        <p className="jobs-kicker"><span /> Your next chapter starts here</p>
        <h1>Turn your skills into <span>real opportunities</span></h1>
        <span className="jobs-heading-flourish" aria-hidden="true" />
        <p className="jobs-intro">
          Explore external job boards for your chosen career. CareerAI helps you get to the search;
          each portal provides its own live listings and application details.
        </p>
      </header>

      <div className="jobs-layout">
        <aside className="jobs-story" aria-label="Career encouragement">
          <div className="jobs-art-frame">
            <span className="jobs-art-spark jobs-art-spark-one" aria-hidden="true" />
            <span className="jobs-art-spark jobs-art-spark-two" aria-hidden="true" />
            <img
              src="/images/scenes/career-path-girl.png"
              alt="Learner with a laptop and books"
              className="jobs-student-art"
            />
          </div>
          <div className="jobs-story-note">
            <span className="jobs-story-icon" aria-hidden="true"><Briefcase size={17} /></span>
            <div>
              <h2>Make your next move</h2>
              <p>Compare openings on trusted job boards, then review each listing on its original site.</p>
            </div>
          </div>
          <p className="jobs-story-footnote">One search, four places to explore.</p>
        </aside>

        <section className="jobs-search-panel" aria-labelledby="jobs-search-title">
          <div className="jobs-panel-heading">
            <span className="jobs-search-icon" aria-hidden="true"><Compass size={19} /></span>
            <div>
              <p className="jobs-panel-eyebrow">Personalized to your path</p>
              <h2 id="jobs-search-title">Set up your job search</h2>
            </div>
          </div>

          <div className="jobs-fields">
            <div className="jobs-field">
              <label htmlFor="jobs-role">Career role</label>
              <div className="jobs-input-wrap">
                <Search size={17} aria-hidden="true" />
                <input
                  id="jobs-role"
                  className="jobs-input is-readonly"
                  type="text"
                  value={selectedCareer.title}
                  disabled
                />
              </div>
              <p className="jobs-field-hint">Set by your selected career path</p>
            </div>

            <div className="jobs-field">
              <label htmlFor="jobs-location">Location</label>
              <div className="jobs-input-wrap">
                <MapPin size={17} aria-hidden="true" />
                <input
                  id="jobs-location"
                  className="jobs-input"
                  type="text"
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  placeholder="City, state, or remote"
                  autoComplete="address-level2"
                  aria-describedby="jobs-location-hint"
                />
              </div>
              <p className="jobs-field-hint" id="jobs-location-hint">Change this any time to search another area</p>
            </div>
          </div>

          <div className="jobs-destinations-heading">
            <div>
              <h3>Choose a destination</h3>
              <p>Open a search on one of these external job boards.</p>
            </div>
            <span className="jobs-external-label"><Globe2 size={14} /> External results</span>
          </div>

          <div className="jobs-portal-list">
            {portals.map((portal) => (
              <a
                key={portal.name}
                href={hasLocation ? portal.url : undefined}
                target="_blank"
                rel="noopener noreferrer"
                aria-disabled={!hasLocation}
                tabIndex={hasLocation ? 0 : -1}
                className={`jobs-portal-card ${portal.visual}${hasLocation ? '' : ' is-disabled'}`}
              >
                <span className="jobs-portal-mark" aria-hidden="true">{portal.mark}</span>
                <span className="jobs-portal-copy">
                  <strong>{portal.name}</strong>
                  <small>{portal.description}</small>
                  <span className="jobs-portal-source">{portal.source}</span>
                </span>
                <span className="jobs-portal-cta">Search <ExternalLink size={14} aria-hidden="true" /></span>
              </a>
            ))}
          </div>

          {!hasLocation && (
            <p className="jobs-location-alert" role="status">
              Enter a location to enable external searches.
            </p>
          )}

          <p className="jobs-disclaimer">
            CareerAI does not fetch or store job listings. Availability, job details, and application
            requirements are provided by each external destination.
          </p>
        </section>
      </div>
    </main>
  );
}
