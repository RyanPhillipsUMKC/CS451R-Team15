import { useState, useEffect, useRef } from "react";
import AppHeader from "../Header/Header";
import { UserAuth } from "../authContext";
import "./PortfolioStyle.css";

// ─── Market Data ───────────────────────────────────────────────────────────────
// Single source of truth for mock prices, colors, and exchange for all
// supported tickers. Replace currentPrice values with a live API feed when ready.
const MARKET_DATA = {
  AAPL:  { currentPrice: 182.50,  dotClass: "dot-blue",   exchange: "NASDAQ", company_name: "Apple Inc." },
  GOOGL: { currentPrice: 178.25,  dotClass: "dot-green",  exchange: "NASDAQ", company_name: "Alphabet Inc." },
  MSFT:  { currentPrice: 441.50,  dotClass: "dot-orange", exchange: "NASDAQ", company_name: "Microsoft Corporation" },
  TSLA:  { currentPrice: 251.75,  dotClass: "dot-red",    exchange: "NASDAQ", company_name: "Tesla, Inc." },
  NVDA:  { currentPrice: 948.00,  dotClass: "dot-purple", exchange: "NASDAQ", company_name: "NVIDIA Corporation" },
};

// ─── Mock Recommendations ──────────────────────────────────────────────────────
// Shown as placeholder until the user clicks "Analyze Portfolio".
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
// Sends real holdings + cash to a locally-running Ollama instance.
// Expects a JSON array back: [{ ticker, action, confidence, reasoning }, ...]
// Recommendations cover both current holdings (BUY/HOLD/SELL) and potential new
// buys from the full supported ticker list.
async function analyzePortfolio(holdings, cashBalance, model = "llama3.2") {
  const holdingsText = holdings
    .map((h) => {
      const market = MARKET_DATA[h.ticker];
      const currentPrice = market?.currentPrice ?? h.averageCost;
      const currentValue = h.shares * currentPrice;
      const unrealizedPnL = currentValue - h.totalCost;
      const unrealizedPct =
        h.totalCost > 0 ? (unrealizedPnL / h.totalCost) * 100 : 0;
      return (
        `- ${h.ticker} (${h.company_name}): ` +
        `${h.shares} shares, avg cost $${h.averageCost.toFixed(2)}/share, ` +
        `current price $${currentPrice.toFixed(2)}/share, ` +
        `current value $${currentValue.toFixed(2)}, ` +
        `unrealized P&L ${unrealizedPnL >= 0 ? "+" : ""}$${unrealizedPnL.toFixed(2)} ` +
        `(${unrealizedPct >= 0 ? "+" : ""}${unrealizedPct.toFixed(1)}%)`
      );
    })
    .join("\n");

  const tickerList = holdings
    .map((h) => `{ "ticker": "${h.ticker}", "action": "BUY|HOLD|SELL", "confidence": 0-100, "reasoning": "..." }`)
    .join(",\n  ");

  const prompt = `You are a financial analyst assistant for a mock stock trading application.

Analyze the user's current holdings and provide a BUY (add more shares), HOLD, or SELL recommendation for EACH held position only.

Available cash: $${cashBalance.toFixed(2)}

Current holdings:
${holdingsText}

Instructions:
- Only provide recommendations for the stocks listed above — do not suggest other tickers.
- BUY means the user should add more shares of that stock.
- HOLD means keep the current position.
- SELL means reduce or exit the position.
- Factor in unrealized P&L, current valuation, and available cash.
- Confidence should be a number 0-100.
- Keep reasoning concise (1-2 sentences).

Respond with ONLY a JSON array covering exactly these tickers, no other text:
[
  ${tickerList}
]`;

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
function Portfolio() {
  const { getUserFinancialSummary } = UserAuth();

  // Live data from Supabase
  const [cashBalance, setCashBalance] = useState(0);
  const [portfolioValue, setPortfolioValue] = useState(0);
  const [holdings, setHoldings] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  // AI analysis state
  const [recommendations, setRecommendations] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);

  // Chart state — default to first supported ticker
  const allTickers = Object.keys(MARKET_DATA);
  const [selectedTicker, setSelectedTicker] = useState(allTickers[0]);

  // ── Load real holdings + cash from Supabase ────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setDataLoading(true);

      const result = await getUserFinancialSummary();

      if (cancelled) return;

      if (result.success) {
        const { cashBalance: cash, holdings: holdingsMap } = result.data;

        const holdingsArray = Object.values(holdingsMap ?? {});

        // Compute current portfolio value using mock market prices
        const totalPortfolioValue = holdingsArray.reduce((sum, h) => {
          const price = MARKET_DATA[h.ticker]?.currentPrice ?? h.averageCost;
          return sum + h.shares * price;
        }, 0);

        setCashBalance(Number(cash ?? 0));
        setPortfolioValue(totalPortfolioValue);
        setHoldings(holdingsArray);

        // Default chart to the first held ticker if available
        if (holdingsArray.length > 0 && MARKET_DATA[holdingsArray[0].ticker]) {
          setSelectedTicker(holdingsArray[0].ticker);
        }
      } else {
        console.error("Failed to load financial summary:", result.error);
      }

      setDataLoading(false);
    }

    load();

    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Run Ollama analysis ────────────────────────────────────────────────────
  async function handleAnalyze() {
    if (holdings.length === 0) return;
    setIsAnalyzing(true);
    setAnalysisError(null);
    try {
      const recs = await analyzePortfolio(holdings, cashBalance);
      setRecommendations(recs);
    } catch (err) {
      console.error(err);
      setAnalysisError(
        "Could not reach Ollama. Make sure it is running locally (ollama serve) and a model is pulled (ollama pull llama3.2)."
      );
    } finally {
      setIsAnalyzing(false);
    }
  }

  const fmt = (n) =>
    Number(n).toLocaleString("en-US", { style: "currency", currency: "USD" });

  const selectedMarket = MARKET_DATA[selectedTicker];

  // For the chart selector, show all tickers — highlight any the user holds
  const heldTickers = new Set(holdings.map((h) => h.ticker));

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
            <div className="stat-value">
              {dataLoading ? "—" : fmt(cashBalance)}
            </div>
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
            <div className="stat-value">
              {dataLoading ? "—" : fmt(portfolioValue)}
            </div>
            <div className="stat-subtitle">
              Total Account:{" "}
              <span className="green-text invested-text">
                {dataLoading ? "—" : fmt(cashBalance + portfolioValue)}
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
                {MARKET_DATA[selectedTicker]?.company_name ?? selectedTicker}
                {heldTickers.has(selectedTicker) && (
                  <> &mdash; {holdings.find((h) => h.ticker === selectedTicker)?.shares ?? 0} shares held</>
                )}
              </p>
            </div>

            <div className="chart-selector">
              {allTickers.map((ticker) => (
                <button
                  key={ticker}
                  className={`chart-selector-btn ${MARKET_DATA[ticker].dotClass} ${
                    selectedTicker === ticker ? "chart-selector-btn-active" : ""
                  }`}
                  onClick={() => setSelectedTicker(ticker)}
                >
                  {ticker}
                </button>
              ))}
            </div>
          </div>

          <TradingViewChart
            key={selectedTicker}
            symbol={selectedTicker}
            exchange={selectedMarket.exchange}
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
              disabled={isAnalyzing || dataLoading || holdings.length === 0}
            >
              {isAnalyzing ? (
                <>
                  <span className="spinner" />
                  Analyzing…
                </>
              ) : (
                <>
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
              <span className="blue-text">Cash available:</span>{" "}
              {dataLoading ? "loading…" : fmt(cashBalance)}
            </span>
            <span className="context-chip">
              <span className="green-text">Holdings:</span>{" "}
              {dataLoading ? "loading…" : `${holdings.length} position${holdings.length !== 1 ? "s" : ""}`}
            </span>
            <span className="context-chip">
              <span className="orange-text">Model:</span> llama3.2 (local)
            </span>
          </div>

          <div className="portfolio-divider" style={{ marginBottom: 0 }} />

          <div className="recommendations-list">
            {recommendations.length === 0 && (
              <div className="holding-row" style={{ padding: "28px 32px", color: "#9ca3af" }}>
                {holdings.length === 0
                  ? "No holdings found. Make some trades on the Transact page first."
                  : "Click \"Analyze Portfolio\" to get AI recommendations for your holdings."}
              </div>
            )}
            {recommendations.map((rec) => {
              const market = MARKET_DATA[rec.ticker];
              const holding = holdings.find((h) => h.ticker === rec.ticker);
              return (
                <div className="recommendation-item" key={rec.ticker}>
                  <div className="rec-top">
                    <div className="rec-identity">
                      <span className={`holding-dot ${market?.dotClass ?? ""}`} />
                      <div>
                        <span className="holding-ticker">{rec.ticker}</span>
                        {market && (
                          <span className="holding-name"> — {market.company_name}</span>
                        )}
                        {holding && (
                          <span className="holding-name"> ({holding.shares} shares held)</span>
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
