import { findCalculatorByRoute } from '../calculators/registry';

export function CalculatorRouteRenderer({ path }: { path: string }) {
  const calculator = findCalculatorByRoute(path);

  if (calculator?.component) {
    const Calculator = calculator.component;
    return <Calculator />;
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
        </nav>
      </header>
      <div className="page-wrap">
        <section className="about-section">
          <span className="section-label">{calculator ? 'COMING SOON' : 'NOT FOUND'}</span>
          <h2>{calculator ? calculator.name : 'Calculator Not Found'}</h2>
          <p>{calculator ? calculator.description : 'This calculator path is invalid.'}</p>
        </section>
      </div>
    </div>
  );
}
