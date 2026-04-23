import { useEffect, useMemo, useState } from "react";
import { UserAuth } from "../authContext";
import AppHeader from "../Header/Header";
import "./DashboardStyle.css";

function Dashboard() {
  const [startingFunds, setStartingFunds] = useState(0);
  const [cashBalance, setCashBalance] = useState(0);
  const [realHoldings, setRealHoldings] = useState({});
  const [liveMarketData, setLiveMarketData] = useState({});
  const [loading, setLoading] = useState(true);

  const { user, getUserFinancialSummary, getLiveMarketData } = UserAuth();

  const metadata = user?.user_metadata;

  const dotClassToColor = {
    "dot-blue": "#3b82f6",
    "dot-green": "#22c55e",
    "dot-orange": "#f59e0b",
    "dot-red": "#ff6b6b",
    "dot-purple": "#8b5cf6",
  };

  const dotClassToTextClass = {
    "dot-blue": "blue-text",
    "dot-green": "green-text",
    "dot-orange": "orange-text",
    "dot-red": "red-text",
    "dot-purple": "purple-text",
  };

  const fallbackDotClasses = [
    "dot-blue",
    "dot-green",
    "dot-orange",
    "dot-red",
    "dot-purple",
  ];

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true);

      const [summaryResult, marketResult] = await Promise.all([
        getUserFinancialSummary(),
        getLiveMarketData(),
      ]);

      if (summaryResult.success) {
        const summary = summaryResult.data;
        setStartingFunds(Number(summary.startingFunds ?? 0));
        setCashBalance(Number(summary.cashBalance ?? 0));
        setRealHoldings(summary.holdings ?? {});
      } else {
        console.error(summaryResult.error);
        setStartingFunds(0);
        setCashBalance(0);
        setRealHoldings({});
      }

      if (marketResult.success) {
        setLiveMarketData(marketResult.data ?? {});
      } else {
        console.error(marketResult.error);
        setLiveMarketData({});
      }

      setLoading(false);
    }

    loadDashboardData();
  }, [getUserFinancialSummary, getLiveMarketData]);

  const holdings = useMemo(() => {
    const holdingsArray = Object.values(realHoldings ?? {});

    return holdingsArray.map((holding, index) => {
      const market = liveMarketData[holding.ticker] ?? {
        currentPrice: 0,
      };

      const shares = Number(holding.shares || 0);
      const averageCost = Number(holding.averageCost || 0);
      const totalCost = Number(holding.totalCost || 0);
      const currentPrice = Number(market.currentPrice || 0);

      const currentValue = shares * currentPrice;
      const gainLoss = currentValue - totalCost;
      const percentChange = totalCost > 0 ? (gainLoss / totalCost) * 100 : 0;

      const dotClass =
        fallbackDotClasses[index % fallbackDotClasses.length];

      return {
        ticker: holding.ticker,
        name: holding.company_name,
        shares,
        averageCost,
        totalCost,
        currentPrice,
        valueNumber: currentValue,
        value: `$${currentValue.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
        change: `${percentChange >= 0 ? "+" : ""}${percentChange.toFixed(2)}%`,
        dotClass,
      };
    });
  }, [realHoldings, liveMarketData]);

  const totalPortfolioValue = useMemo(() => {
    return holdings.reduce((sum, holding) => sum + holding.valueNumber, 0);
  }, [holdings]);

  const totalAccountBalance = cashBalance + totalPortfolioValue;

  const investedPercent =
    totalAccountBalance > 0
      ? (totalPortfolioValue / totalAccountBalance) * 100
      : 0;

  const totalProfitLoss = totalAccountBalance - startingFunds;

  const profitPercent =
    startingFunds > 0
      ? (totalProfitLoss / startingFunds) * 100
      : 0;

  const allocationData = useMemo(() => {
    if (totalPortfolioValue <= 0) return [];

    return holdings
      .filter((holding) => holding.valueNumber > 0)
      .map((holding) => ({
        ticker: holding.ticker,
        percent: (holding.valueNumber / totalPortfolioValue) * 100,
        dotClass: holding.dotClass,
      }));
  }, [holdings, totalPortfolioValue]);

  const pieChartBackground = useMemo(() => {
    if (allocationData.length === 0) {
      return "#22252f";
    }

    let currentDegree = 0;

    const segments = allocationData.map((item) => {
      const color = dotClassToColor[item.dotClass] || "#3b82f6";
      const start = currentDegree;
      const end = currentDegree + (item.percent / 100) * 360;
      currentDegree = end;
      return `${color} ${start}deg ${end}deg`;
    });

    return `conic-gradient(${segments.join(", ")})`;
  }, [allocationData]);

  return (
    <div className="app">
      <AppHeader />

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

        <div className="hero-welcome">
          Welcome, {metadata?.first_name} {metadata?.last_name}
        </div>
      </section>

      <main className="main-content">
        <section className="summary-grid">
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
            <div className="stat-value">
              $
              {cashBalance.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            <div className="stat-subtitle">Available liquid funds</div>
          </div>

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
            <div className="stat-value">
              $
              {totalAccountBalance.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            <div className="stat-subtitle">
              Investments: $
              {totalPortfolioValue.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              <span className="green-text invested-text">
                {investedPercent.toFixed(1)}% invested
              </span>
            </div>
          </div>
        </section>

        <section className="card portfolio-card">
          <div className="portfolio-top">
            <h2>Portfolio Overview</h2>

            <div className="portfolio-stats">
              <div>
                <div className="portfolio-label">Total Portfolio Value</div>
                <div className="portfolio-value">
                  $
                  {totalPortfolioValue.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
              </div>

              <div>
                <div className="portfolio-label">Total Profit/Loss</div>
                <div
                  className={
                    totalProfitLoss >= 0
                      ? "portfolio-value green-text"
                      : "portfolio-value red-text"
                  }
                >
                  {totalProfitLoss >= 0 ? "+" : "-"}$
                  {Math.abs(totalProfitLoss).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>

                <div className="portfolio-label">
                  {profitPercent.toFixed(2)}%
                </div>
              </div>
            </div>
          </div>

          <div className="portfolio-divider" />

          <div className="portfolio-bottom">
            <div className="allocation-section">
              <h3>Asset Allocation</h3>

              <div className="allocation-wrapper">
                {allocationData.length === 0 ? (
                  <div className="holding-row" style={{ marginTop: "20px" }}>
                    No holdings to display.
                  </div>
                ) : (
                  <>
                    <div
                      className="pie-chart"
                      style={{ background: pieChartBackground }}
                    >
                      <div className="pie-center" />
                    </div>

                    <div
                      style={{
                        marginTop: "22px",
                        display: "flex",
                        flexWrap: "wrap",
                        justifyContent: "center",
                        gap: "12px 18px",
                      }}
                    >
                      {allocationData.map((item) => (
                        <span
                          key={item.ticker}
                          className={dotClassToTextClass[item.dotClass] || ""}
                          style={{ fontSize: "15px", fontWeight: 500 }}
                        >
                          {item.ticker} {item.percent.toFixed(1)}%
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="holdings-section">
              <h3>Holdings</h3>

              <div className="holdings-list">
                {loading ? (
                  <div className="holding-row">Loading holdings...</div>
                ) : holdings.length === 0 ? (
                  <div className="holding-row">No holdings found.</div>
                ) : (
                  holdings.map((holding) => (
                    <div className="holding-row" key={holding.ticker}>
                      <div className="holding-left">
                        <span className={`holding-dot ${holding.dotClass}`} />
                        <div>
                          <div className="holding-ticker">
                            {holding.ticker} ({holding.shares} shares)
                          </div>
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
                  ))
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;