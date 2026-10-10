import { useMemo } from 'react';
import { CalculatorRouteRenderer } from './components/CalculatorRouteRenderer';
import { calculatorCatalog } from './calculators/registry';

function getPathFromLocation() {
  if (typeof window === 'undefined') return '/';
  return window.location.pathname || '/';
}

export default function App() {
  const path = useMemo(() => getPathFromLocation(), []);

  if (path !== '/') {
    return <CalculatorRouteRenderer path={path} />;
  }

  return (
    <div className="page-shell">
      <header className="site-header">
        <div className="logo">
          <img src="/logo.svg" alt="Electrical Tool logo" className="logo-icon" />
          <span>Electrical Tool</span>
        </div>
        <nav>
          <a href="/">Tools</a>
          <a href="#about">About</a>
          <a href="#feedback">Feedback</a>
        </nav>
      </header>

      <div className="page-wrap" id="tools">
        <div className="hero">
          <div className="hero-text">
            <h1>Electrical Engineering Calculators</h1>
            <p className="mission">
              Electrical Tool is built by an electrical engineer, with the help of AI, to give students and enthusiasts free access to core electrical engineering calculators.
            </p>
          </div>
          <div className="title-block">
            <div>Standard</div>
            <div>IEC</div>
            <div>Status</div>
            <div>Live</div>
            <div>Access</div>
            <div>Free</div>
          </div>
        </div>

        <div className="tool-grid">
          {calculatorCatalog.map((tool) => {
            const cardContent = (
              <>
                <span className="icon">{tool.icon}</span>
                <h3>{tool.name}</h3>
                <p>{tool.description}</p>
                <span className={`tag ${tool.status === 'coming-soon' ? 'tag-muted' : ''}`}>
                  {tool.status === 'live' ? 'IEC · LIVE' : 'COMING SOON'}
                </span>
              </>
            );

            return tool.status === 'live' ? (
              <a key={tool.id} className="tool-card" href={tool.route}>
                {cardContent}
              </a>
            ) : (
              <div key={tool.id} className="tool-card tool-card-coming-soon">
                {cardContent}
              </div>
            );
          })}
        </div>
      </div>

      <section className="about-section" id="about">
        <span className="section-label">ABOUT THE PROJECT</span>
        <h2>Built for Practical Engineering</h2>
        <p>Electrical Tool is a growing collection of practical calculators and tools designed for electrical engineers, technicians, students, and anyone working with electrical systems.</p>
        <p>Our goal is simple: to make engineering calculations faster, clearer, and more accessible.</p>
      </section>

      <section className="feedback-section" id="feedback">
        <div className="feedback-header">
          <span className="section-label">COMMUNITY INPUT</span>
          <h2>Help Us Improve</h2>
          <p>Your feedback matters to us. Have an idea for a new calculator, found an error, or have a suggestion for improving an existing tool?</p>
        </div>
      </section>
    </div>
  );
}
