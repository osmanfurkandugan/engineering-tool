import { CableSizingCalculator } from '../calculators/cable-sizing/CableSizingCalculator';
import { LoadCurrentCalculator } from '../calculators/load-current/LoadCurrentCalculator';
import { VoltageDropCalculator } from '../calculators/voltage-drop/VoltageDropCalculator';

export function CalculatorRouteRenderer({ path }: { path: string }) {
  switch (path) {
    case '/voltage-drop':
      return <VoltageDropCalculator />;
    case '/cable-sizing':
      return <CableSizingCalculator />;
    case '/load-current':
      return <LoadCurrentCalculator />;
    default:
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
              <span className="section-label">COMING SOON</span>
              <h2>Calculator Not Found</h2>
              <p>This calculator is not available yet or the path is invalid.</p>
            </section>
          </div>
        </div>
      );
  }
}
