import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "./PortfolioStyle.css";

// ─── Mock Data ─────────────────────────────────────────────────────────────────
// TODO: Replace with Supabase queries once schema is finalized
const MOCK_HOLDINGS = [
  { ticker: "AAPL", name: "Apple Inc.",     shares: 45, value: 8926.00,  change: "+8.00%", dotClass: "dot-blue",   exchange: "NASDAQ" },
  { ticker: "GOOGL", name: "Alphabet Inc.", shares: 12, value: 4285.50,  change: "+5.20%", dotClass: "dot-green",  exchange: "NASDAQ" },
  { ticker: "MSFT", name: "Microsoft Corp.",shares: 31, value: 10154.00, change: "+3.90%", dotClass: "dot-orange", exchange: "NASDAQ" },
  { ticker: "TSLA", name: "Tesla Inc.",     shares: 40, value: 6840.00,  change: "-1.40%", dotClass: "dot-red",    exchange: "NASDAQ" },
  { ticker: "NVDA", name: "NVIDIA Corp.",   shares: 18, value: 7403.50,  change: "+6.10%", dotClass: "dot-purple", exchange: "NASDAQ" },
];

const MOCK_CASH = 25000.00;
const MOCK_PORTFOLIO_VALUE = MOCK_HOLDINGS.reduce((sum, h) => sum + h.value, 0);

// ─── Mock AI Recommendations ──────────────────────────────────────────────────
// TODO: Replace with live Ollama API call (see analyzePortfolio below)
const MOCK_RECOMMENDATIONS = [
  {
    ticker: "AAPL",
    action: "HOLD",
    confidence: 78,
    reasoning:
      "Strong fundamentals with consistent revenue growth. Current price is near fair value — maintain position and reassess on next earnings report.",
  },
  {
    ticker: "GOOGL",
    action: "BUY",
    confidence: 85,
    reasoning:
      "AI integration and cloud segment growth present strong upside. With available cash, consider adding shares on any pullback toward the 50-day MA.",
  },
  {
    ticker: "MSFT",
    action: "BUY",
    confidence: 82,
    reasoning:
      "Azure growth remains robust and Copilot monetization is beginning to show results. Strong accumulation candidate at current levels.",
  },
  {
    ticker: "TSLA",
    action: "SELL",
    confidence: 71,
    reasoning:
      "Declining margins and increased EV competition create meaningful headwinds. Consider rotating proceeds into higher-conviction positions.",
  },
  {
    ticker: "NVDA",
    action: "HOLD",
    confidence: 88,
    reasoning:
      "AI chip demand remains high, but valuation is stretched. Hold current position and watch for dips as entry points for additional shares.",
  },
];

// ─── Ollama Integration ────────────────────────────────────────────────────────
// TODO: Wire up Supabase to pull real holdings + cash, then pass to Ollama.
// Ollama runs locally at http://localhost:11434 by default.
// The prompt is constructed here so the LLM has full portfolio context.
async function analyzePortfolio(holdings, cash, model = "llama3") {
  const prompt = `
You are a financial analyst assistant. A user's portfolio is listed below.
Analyze each holding and provide a BUY, HOLD, or SELL recommendation.
Also factor in that the user has $${cash.toFixed(2)} in available cash for new purchases.

Portfolio:
${holdings
  .map(
    (h) =>
      `- ${h.ticker} (${h.name}): ${h.shares} shares, current value $${h.value.toFixed(2)}, recent change ${h.change}`
  )
  .join("\n")}

For each ticker, respond with a JSON array in this exact format (no extra text):
[
  { "ticker": "AAPL", "action": "BUY|HOLD|SELL", "confidence": 0-100, "reasoning": "..." },
  ...
]
`;

  // TODO: Supabase call here to fetch real portfolio data before running analysis
  // const { data, error } = await supabase.from("holdings").select("*").eq("user_id", userId);

  const response = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, prompt, stream: false }),
  });

  if (!response.ok) throw new Error(`Ollama error: ${response.status}`);

  const result = await response.json();
  // Ollama wraps the response text in result.response
  const jsonMatch = result.response.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error("Could not parse recommendations from model response.");
  return JSON.parse(jsonMatch[0]);
}

// ─── TradingView Advanced Chart ───────────────────────────────────────────────
function TradingViewChart({ symbol, exchange }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const containerId = `tv_${symbol}_${Date.now()}`;
    el.innerHTML = `<div id="${containerId}" style="height:100%"></div>`;

    function createWidget() {
      new window.TradingView.widget({
        autosize: true,
        symbol: `${exchange}:${symbol}`,
        interval: "D",
        timezone: "America/Chicago",
        theme: "dark",
        style: "1",
        locale: "en",
        toolbar_bg: "#11141a",
        enable_publishing: false,
        hide_top_toolbar: false,
        save_image: false,
        container_id: containerId,
        backgroundColor: "rgba(26,29,36,1)",
        gridColor: "rgba(51,51,51,0.4)",
        withdateranges: true,
        allow_symbol_change: true,
      });
    }

    if (window.TradingView) {
      createWidget();
    } else {
      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/tv.js";
      script.async = true;
      script.onload = createWidget;
      document.head.appendChild(script);
    }

    return () => {
      el.innerHTML = "";
    };
  }, [symbol, exchange]);

  return <div ref={containerRef} className="tradingview-wrapper" />;
}

// ─── Action Badge ─────────────────────────────────────────────────────────────
function ActionBadge({ action }) {
  const cls =
    action === "BUY" ? "action-badge buy" : action === "SELL" ? "action-badge sell" : "action-badge hold";
  return <span className={cls}>{action}</span>;
}

// ─── Main Page ────────────────────────────────────────────────────────────────
function Portfolio({ user }) {
  const [selectedTicker, setSelectedTicker] = useState(MOCK_HOLDINGS[0].ticker);
  const [recommendations, setRecommendations] = useState(MOCK_RECOMMENDATIONS);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);

  const selectedHolding = MOCK_HOLDINGS.find((h) => h.ticker === selectedTicker);

  async function handleAnalyze() {
    setIsAnalyzing(true);
    setAnalysisError(null);
    try {
      // TODO: pass real Supabase holdings + cash once connected
      const recs = await analyzePortfolio(MOCK_HOLDINGS, MOCK_CASH);
      setRecommendations(recs);
    } catch (err) {
      console.error(err);
      setAnalysisError(
        "Could not reach Ollama. Make sure it is running locally (ollama serve) and a model is pulled."
      );
      // Fall back to mock data so the UI stays populated
      setRecommendations(MOCK_RECOMMENDATIONS);
    } finally {
      setIsAnalyzing(false);
    }
  }

  const fmt = (n) =>
    n.toLocaleString("en-US", { style: "currency", currency: "USD" });

  return (
    <div className="app">
      {/* ── Topbar ── */}
      <header className="topbar">
        <nav className="topbar-nav">
          <Link to="/dashboard" className="nav-link">
            Dashboard
          </Link>
          <Link to="/portfolio" className="nav-link nav-link-active">
            Portfolio Analysis
          </Link>
        </nav>

        <div className="topbar-center">
          <span>Investment Tracking Plugin</span>
          <span className="dropdown-arrow">▾</span>
        </div>

        <Link to="/profile" className="profile-button">
          {user.name}
        </Link>
      </header>

      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-icon">
          {/* Brain + chart icon */}
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
            <path d="M3 3v18h18" />
            <path d="M7 16l4-4 4 4 4-8" />
            <circle cx="19" cy="5" r="2" />
          </svg>
        </div>
        <div>
          <h1>Portfolio Analysis</h1>
          <p>AI-powered insights &amp; TradingView charts for your holdings</p>
        </div>
      </section>

      <main className="main-content">
        {/* ── Summary Stats ── */}
        <section className="summary-grid">
          <div className="card stat-card">
            <div className="stat-header">
              <span className="stat-icon blue-text">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="M16 12h.01" />
                  <path d="M3 10h18" />
                </svg>
              </span>
              <span>Cash Balance</span>
            </div>
            <div className="stat-value">{fmt(MOCK_CASH)}</div>
            <div className="stat-subtitle">Available for new positions</div>
          </div>

          <div className="card stat-card">
            <div className="stat-header">
              <span className="stat-icon green-text">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 15l5-5 4 4 7-7" />
                  <path d="M16 7h4v4" />
                </svg>
              </span>
              <span>Invested Portfolio Value</span>
            </div>
            <div className="stat-value">{fmt(MOCK_PORTFOLIO_VALUE)}</div>
            <div className="stat-subtitle">
              Total Account:{" "}
              <span className="green-text invested-text">
                {fmt(MOCK_CASH + MOCK_PORTFOLIO_VALUE)}
              </span>
            </div>
          </div>
        </section>

        {/* ── TradingView Chart ── */}
        <section className="card chart-card">
          <div className="chart-header">
            <div>
              <h2>Advanced Chart</h2>
              <p className="chart-subtitle">
                {selectedHolding.name} &mdash; {selectedHolding.shares} shares held
              </p>
            </div>

            <div className="chart-selector">
              {MOCK_HOLDINGS.map((h) => (
                <button
                  key={h.ticker}
                  className={`chart-selector-btn ${h.dotClass} ${
                    selectedTicker === h.ticker ? "chart-selector-btn-active" : ""
                  }`}
                  onClick={() => setSelectedTicker(h.ticker)}
                >
                  {h.ticker}
                </button>
              ))}
            </div>
          </div>

          {/* key forces a clean remount when ticker changes */}
          <TradingViewChart
            key={selectedTicker}
            symbol={selectedTicker}
            exchange={selectedHolding.exchange}
          />
        </section>

        {/* ── AI Analysis ── */}
        <section className="card analysis-card">
          <div className="analysis-header">
            <div>
              <h2>AI Recommendations</h2>
              <p className="chart-subtitle">
                Powered by Ollama &mdash; runs locally, no data leaves your machine
              </p>
            </div>

            <button
              className="analyze-btn"
              onClick={handleAnalyze}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <span className="spinner" />
                  Analyzing…
                </>
              ) : (
                <>
                  {/* sparkle icon */}
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
                  </svg>
                  Analyze Portfolio
                </>
              )}
            </button>
          </div>

          {analysisError && (
            <div className="analysis-error">{analysisError}</div>
          )}

          <div className="analysis-context">
            <span className="context-chip">
              <span className="blue-text">Cash available:</span> {fmt(MOCK_CASH)}
            </span>
            <span className="context-chip">
              <span className="green-text">Holdings:</span> {MOCK_HOLDINGS.length} positions
            </span>
            <span className="context-chip">
              <span className="orange-text">Model:</span> llama3 (local)
            </span>
          </div>

          <div className="portfolio-divider" style={{ marginBottom: 0 }} />

          <div className="recommendations-list">
            {recommendations.map((rec) => {
              const holding = MOCK_HOLDINGS.find((h) => h.ticker === rec.ticker);
              return (
                <div className="recommendation-item" key={rec.ticker}>
                  <div className="rec-top">
                    <div className="rec-identity">
                      <span className={`holding-dot ${holding?.dotClass ?? ""}`} />
                      <div>
                        <span className="holding-ticker">{rec.ticker}</span>
                        {holding && (
                          <span className="holding-name"> — {holding.name}</span>
                        )}
                      </div>
                    </div>

                    <div className="rec-right">
                      <ActionBadge action={rec.action} />
                      <div className="confidence-wrap">
                        <span className="confidence-label">
                          {rec.confidence}% confidence
                        </span>
                        <div className="confidence-bar">
                          <div
                            className={`confidence-fill cf-${rec.action.toLowerCase()}`}
                            style={{ width: `${rec.confidence}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="rec-reasoning">{rec.reasoning}</p>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}

export default Portfolio;
