import { Link, Navigate } from "react-router-dom";
import { UserAuth } from "../authContext";
import "./LandingPageStyle.css";

export default function LandingPage() {
  const { session } = UserAuth();

  if (session === undefined) {
    return (
      <div className="landing-page">
        <div className="landing-loading">Loading...</div>
      </div>
    );
  }

  if (session) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="landing-page">
      <div className="landing-content">
        <div className="landing-left">
          <div className="landing-badge">Team 15 - Investment Tracking Platform</div>

          <h1 className="landing-title">
            Track your portfolio with a cleaner, smarter dashboard
          </h1>

          <p className="landing-subtitle">
            Monitor holdings, review account balances, and navigate charts from
            a single dashboard built with a clean, focused interface.
          </p>

          <Link to="/signin" className="landing-link">
            <button className="landing-button">Login</button>
          </Link>


          <Link
            to="https://github.com/RyanPhillipsUMKC/CS451R-Team15"
            target="_blank"
            className="landing-github-link"
          >
            <div className="landing-github">
              <div className="landing-github-icon">
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="currentColor"
                >
                  <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.1 3.29 9.42 7.86 10.95.57.1.78-.25.78-.55 0-.27-.01-1.17-.02-2.13-3.2.7-3.87-1.54-3.87-1.54-.52-1.33-1.27-1.68-1.27-1.68-1.04-.7.08-.69.08-.69 1.15.08 1.75 1.18 1.75 1.18 1.02 1.74 2.68 1.24 3.33.95.1-.74.4-1.24.73-1.53-2.55-.29-5.23-1.28-5.23-5.7 0-1.26.45-2.3 1.18-3.11-.12-.29-.51-1.47.11-3.06 0 0 .97-.31 3.18 1.18a10.9 10.9 0 012.9-.39c.98 0 1.97.13 2.9.39 2.2-1.5 3.17-1.18 3.17-1.18.63 1.59.24 2.77.12 3.06.74.81 1.18 1.85 1.18 3.11 0 4.43-2.69 5.4-5.25 5.68.41.35.78 1.04.78 2.1 0 1.52-.01 2.74-.01 3.11 0 .3.2.66.79.55A11.51 11.51 0 0023.5 12C23.5 5.65 18.35.5 12 .5z" />
                </svg>
              </div>

              <div className="landing-github-text">
                <span className="landing-github-title">
                  Follow development
                </span>
                <span className="landing-github-sub">
                  View progress and updates on GitHub
                </span>
              </div>
            </div>
          </Link>
        </div>

        <div className="landing-right">
          <div className="card landing-preview-card">
            <div className="landing-preview-top">
              <h3>Portfolio Snapshot</h3>
              <span className="landing-preview-badge">Live</span>
            </div>

            <div className="landing-preview-stats">
              <div className="landing-preview-stat">
                <div className="landing-preview-label">Cash Balance</div>
                <div className="landing-preview-value">$25,000.00</div>
                <div className="landing-preview-subtitle">
                  Available liquid funds
                </div>
              </div>

              <div className="landing-preview-stat">
                <div className="landing-preview-label">Total Balance</div>
                <div className="landing-preview-value">$62,609.00</div>
                <div className="landing-preview-subtitle">
                  Investments:
                  <span className="green-text landing-inline-accent">
                    {" "}
                    $37,609.00
                  </span>
                </div>
              </div>
            </div>

            <div className="landing-chart-card">
              <div className="landing-chart-grid-line line-one" />
              <div className="landing-chart-grid-line line-two" />
              <div className="landing-chart-grid-line line-three" />

              <svg
                className="landing-chart-svg"
                viewBox="0 0 400 180"
                preserveAspectRatio="none"
              >
                <path
                  d="M10 145 C 55 145, 85 118, 120 122 C 155 126, 178 82, 212 86 C 248 90, 275 52, 312 54 C 340 56, 365 38, 390 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <div className="landing-preview-divider" />

            <div className="landing-holdings">
              <div className="holding-row">
                <div className="holding-left">
                  <span className="holding-dot dot-blue" />
                  <div>
                    <div className="holding-ticker">AAPL</div>
                    <div className="holding-name">Apple Inc.</div>
                  </div>
                </div>

                <div className="holding-right">
                  <div className="holding-value">$8,926.00</div>
                  <div className="holding-change green-text">+8.00%</div>
                </div>
              </div>

              <div className="holding-row">
                <div className="holding-left">
                  <span className="holding-dot dot-green" />
                  <div>
                    <div className="holding-ticker">GOOGL</div>
                    <div className="holding-name">Alphabet Inc.</div>
                  </div>
                </div>

                <div className="holding-right">
                  <div className="holding-value">$4,285.50</div>
                  <div className="holding-change green-text">+5.20%</div>
                </div>
              </div>

              <div className="holding-row">
                <div className="holding-left">
                  <span className="holding-dot dot-purple" />
                  <div>
                    <div className="holding-ticker">NVDA</div>
                    <div className="holding-name">NVIDIA Corp.</div>
                  </div>
                </div>

                <div className="holding-right">
                  <div className="holding-value">$7,403.50</div>
                  <div className="holding-change green-text">+6.10%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}