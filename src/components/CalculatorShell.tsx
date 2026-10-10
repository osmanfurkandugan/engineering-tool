import type { ReactNode } from 'react';

interface CalculatorShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export function CalculatorShell({ title, subtitle, children }: CalculatorShellProps) {
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

      <div className="breadcrumb">
        <a href="/">Tools</a> / {title}
      </div>

      <div className="calculator-wrap">
        <div className="calculator-card calculator-card-wide">
          <div className="header">
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
