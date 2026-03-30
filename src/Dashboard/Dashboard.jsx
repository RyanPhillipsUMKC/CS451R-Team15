import { useState } from "react";
import { Link } from "react-router-dom";
import "./DashboardStyle.css";

function Dashboard({ user, onLogout }) {
  // State for cash balance
  const [cashBalance, setCashBalance] = useState(25000);

  // Increment function
  const incrementCash = () => {
    setCashBalance((prev) => prev + 1);
  };
  
  const holdings = [
    {
      ticker: "AAPL",
      name: "Apple Inc.",
      value: "$8,926.00",
      change: "+8.00%",
      dotClass: "dot-blue",
    },
    {
      ticker: "GOOGL",
      name: "Alphabet Inc.",
      value: "$4,285.50",
      change: "+5.20%",
      dotClass: "dot-green",
    },
    {
      ticker: "MSFT",
      name: "Microsoft Corp.",
      value: "$10,154.00",
      change: "+3.90%",
      dotClass: "dot-orange",
    },
    {
      ticker: "TSLA",
      name: "Tesla Inc.",
      value: "$6,840.00",
      change: "-1.40%",
      dotClass: "dot-red",
    },
    {
      ticker: "NVDA",
      name: "NVIDIA Corp.",
      value: "$7,403.50",
      change: "+6.10%",
      dotClass: "dot-purple",
    },
  ];

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-center">
          <span>Investment Tracking Plugin</span>
          <span className="dropdown-arrow">▾</span>
        </div>

        <div className="topbar-right">
          <Link to="/stockcharts" className="email-button">
            Charts
          </Link>
          <Link to="/profile" className="profile-button">
            username
          </Link>
        </div>
      </header>

      <section className="hero">
        <div className="hero-icon">
          <svg
            viewBox="0 0 24 24"
            width="26"
            height="26"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 16l5-5 4 4 7-7" />
            <path d="M16 8h4v4" />
          </svg>
        </div>

        <div>
          <h1>Investment Tracker</h1>
          <p>Real-time portfolio monitoring &amp; AI analysis</p>
        </div>
      </section>

      <main className="main-content">
        <section className="summary-grid">
          {/* Cash Balance Card */}
          <div className="card stat-card">
            <div className="stat-header">
              <span className="stat-icon blue-text">
                <svg
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="M16 12h.01" />
                  <path d="M3 10h18" />
                </svg>
              </span>
              <span>Cash Balance</span>
            </div>
            <div className="stat-value" onClick={incrementCash}>
              ${cashBalance.toLocaleString()}
            </div>
            <div className="stat-subtitle">Available liquid funds</div>
          </div>

          {/* Total Account Balance Card */}
          <div className="card stat-card">
            <div className="stat-header">
              <span className="stat-icon green-text">
                <svg
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 15l5-5 4 4 7-7" />
                  <path d="M16 7h4v4" />
                </svg>
              </span>
              <span>Total Account Balance</span>
            </div>
            <div className="stat-value">$62,609.00</div>
            <div className="stat-subtitle">
              Investments: $37,609.00{" "}
              <span className="green-text invested-text">60.1% invested</span>
            </div>
          </div>
        </section>

        {/* Portfolio Overview */}
        <section className="card portfolio-card">
          <div className="portfolio-top">
            <h2>Portfolio Overview</h2>

            <div className="portfolio-stats">
              <div>
                <div className="portfolio-label">Total Portfolio Value</div>
                <div className="portfolio-value">$37,609.00</div>
              </div>

              <div>
                <div className="portfolio-label">Total Profit/Loss</div>
                <div className="portfolio-value green-text">+$844.50</div>
              </div>
            </div>
          </div>

          <div className="portfolio-divider" />

          <div className="portfolio-bottom">
            <div className="allocation-section">
              <h3>Asset Allocation</h3>

              <div className="allocation-wrapper">
                <div className="allocation-label-row top">
                  <span className="green-text">GOOGL 11%</span>
                  <span className="blue-text">AAPL 24%</span>
                </div>

                <div className="pie-chart">
                  <div className="pie-center" />
                </div>

                <div className="allocation-label-row bottom">
                  <span className="orange-text">MSFT 27%</span>
                  <span className="red-text">TSLA 18%</span>
                  <span className="purple-text">NVDA 20%</span>
                </div>
              </div>
            </div>

            <div className="holdings-section">
              <h3>Holdings</h3>

              <div className="holdings-list">
                {holdings.map((holding) => (
                  <div className="holding-row" key={holding.ticker}>
                    <div className="holding-left">
                      <span className={`holding-dot ${holding.dotClass}`} />
                      <div>
                        <div className="holding-ticker">{holding.ticker}</div>
                        <div className="holding-name">{holding.name}</div>
                      </div>
                    </div>

                    <div className="holding-right">
                      <div className="holding-value">{holding.value}</div>
                      <div
                        className={
                          holding.change.startsWith("-")
                            ? "holding-change red-text"
                            : "holding-change green-text"
                        }
                      >
                        {holding.change}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;