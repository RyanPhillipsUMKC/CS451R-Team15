import { useState, useEffect, useRef } from "react";
import AppHeader from "../Header/Header";
import { UserAuth } from "../authContext";
import "../Dashboard/DashboardStyle.css";

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

function ActionBadge({ action }) {
  const cls =
    action === "BUY" ? "action-badge buy" : action === "SELL" ? "action-badge sell" : "action-badge hold";
  return <span className={cls}>{action}</span>;
}

function buildStocksList(marketData) {
  return Object.entries(marketData)
    .map(([ticker, stock]) => `- ${ticker} (${stock.companyName}): $${Number(stock.currentPrice).toFixed(2)}/share`)
    .join("\n");
}

async function analyzeMarket(marketData, model = "llama3.2") {
  const stocksList = buildStocksList(marketData);

  const prompt = `You are a financial market analyst. Analyze the current market conditions across all available stocks and provide your top 10 investment opportunities.

Available stocks and current prices:
${stocksList}

Provide your top 10 recommendations. For each, determine if it should be BUY, HOLD, or SELL based on general market analysis (not a user's specific portfolio).

Respond with ONLY a JSON array, no other text:
[
  { "ticker": "AAPL", "action": "BUY|HOLD|SELL", "confidence": 0-100, "reasoning": "..." },
  ...
]`;

  const response = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, prompt, stream: false }),
  });

  if (!response.ok) throw new Error(`Ollama error: ${response.status}`);

  const result = await response.json();
  const jsonMatch = result.response.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error("Could not parse recommendations.");
  return JSON.parse(jsonMatch[0]);
}

async function getMarketOverview(marketData, model = "llama3.2") {
  const stocksList = buildStocksList(marketData);

  const prompt = `You are a financial market analyst. Based on the stocks and prices below, provide a concise overall market summary.

Available stocks and current prices:
${stocksList}

Respond with ONLY a JSON object in this exact format, no other text:
{
  "sentiment": "Bullish|Bearish|Neutral",
  "summary": "2-3 sentence overview of overall market conditions and key themes",
  "riskLevel": "Low|Moderate|High",
  "sectorTrends": ["trend 1", "trend 2", "trend 3"],
  "keyTakeaway": "One sentence actionable insight for investors"
}`;

  const response = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, prompt, stream: false }),
  });

  if (!response.ok) throw new Error(`Ollama error: ${response.status}`);

  const result = await response.json();
  const jsonMatch = result.response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Could not parse market overview.");
  return JSON.parse(jsonMatch[0]);
}

const MOCK_MARKET_OVERVIEW = {
  sentiment: "Neutral",
  summary: "Markets are showing mixed signals with technology stocks leading modest gains while consumer and energy sectors face headwinds. Macro uncertainty around interest rates continues to weigh on investor sentiment.",
  riskLevel: "Moderate",
  sectorTrends: ["AI and cloud growth driving tech outperformance", "Consumer spending softening amid inflation", "Energy sector volatile on supply concerns"],
  keyTakeaway: "Favor quality growth names with strong balance sheets; maintain defensive positioning in 20-30% of portfolio.",
};

const MOCK_MARKET_RECOMMENDATIONS = [
  { ticker: "AAPL", action: "BUY", confidence: 78, reasoning: "Strong technical setup with support at $180." },
  { ticker: "MSFT", action: "BUY", confidence: 82, reasoning: "AI momentum continues; Azure expansion solid." },
  { ticker: "NVDA", action: "HOLD", confidence: 88, reasoning: "Valuation stretched but chip demand remains strong." },
  { ticker: "TSLA", action: "SELL", confidence: 71, reasoning: "Margin pressure and EV competition intensifying." },
  { ticker: "GOOGL", action: "BUY", confidence: 85, reasoning: "Cloud and AI segments accelerating." },
  { ticker: "AMZN", action: "HOLD", confidence: 75, reasoning: "AWS growth solid but retail facing headwinds." },
  { ticker: "META", action: "BUY", confidence: 72, reasoning: "AI capex paying off; ad market stabilizing." },
  { ticker: "JPM", action: "HOLD", confidence: 68, reasoning: "Financials stable but rates uncertainty remains." },
  { ticker: "WMT", action: "HOLD", confidence: 70, reasoning: "Consumer resilience supports retail." },
  { ticker: "PG", action: "BUY", confidence: 73, reasoning: "Defensive dividend play; stable earnings." },
];

function MarketAnalysis() {
  const { getLiveMarketData } = UserAuth();

  const [marketData, setMarketData] = useState({});
  const [selectedTicker, setSelectedTicker] = useState("AAPL");
  const [dataLoading, setDataLoading] = useState(true);
  const [overview, setOverview] = useState(MOCK_MARKET_OVERVIEW);
  const [recommendations, setRecommendations] = useState(MOCK_MARKET_RECOMMENDATIONS);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setDataLoading(true);
      const result = await getLiveMarketData();
      if (cancelled) return;

      if (result.success) {
        setMarketData(result.data ?? {});
        const tickers = Object.keys(result.data ?? {});
        if (tickers.length > 0) setSelectedTicker(tickers[0]);
      } else {
        console.error("Failed to load market data:", result.error);
      }
      setDataLoading(false);
    }

    load();
    return () => { cancelled = true; };
  }, []);

  async function handleAnalyze() {
    setIsAnalyzing(true);
    setAnalysisError(null);
    try {
      const [recs, ovw] = await Promise.all([
        analyzeMarket(marketData),
        getMarketOverview(marketData),
      ]);
      setRecommendations(recs);
      setOverview(ovw);
    } catch (err) {
      console.error(err);
      setAnalysisError("Could not reach Ollama. Make sure it is running locally.");
      setRecommendations(MOCK_MARKET_RECOMMENDATIONS);
      setOverview(MOCK_MARKET_OVERVIEW);
    } finally {
      setIsAnalyzing(false);
    }
  }

  const selectedMarket = marketData[selectedTicker];
  const allTickers = Object.keys(marketData);

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
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 17"></polyline>
            <polyline points="17 6 23 6 23 12"></polyline>
          </svg>
        </div>
        <div>
          <h1>Market Analysis</h1>
          <p>AI-powered market insights &amp; technical charts</p>
        </div>
      </section>

      <main className="main-content">
        <section className="summary-grid">
          <div className="card stat-card">
            <div className="stat-header">
              <span className="stat-icon blue-text">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v4" />
                </svg>
              </span>
              <span>Total Stocks Tracked</span>
            </div>
            <div className="stat-value">
              {dataLoading ? "—" : allTickers.length}
            </div>
            <div className="stat-subtitle">Actively analyzed</div>
          </div>

          <div className="card stat-card">
            <div className="stat-header">
              <span className="stat-icon green-text">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </span>
              <span>Session Status</span>
            </div>
            <div className="stat-value" style={{ fontSize: "24px" }}>
              {dataLoading ? "Loading…" : "Ready"}
            </div>
            <div className="stat-subtitle">
              {dataLoading ? "Fetching market data" : "Market data available"}
            </div>
          </div>
        </section>

        <section className="card chart-card">
          <div className="chart-header">
            <div>
              <h2>Technical Chart</h2>
              <p className="chart-subtitle">
                {selectedTicker} — {selectedMarket?.companyName || "Loading…"}
              </p>
            </div>

            <div className="chart-selector">
              {allTickers.slice(0, 10).map((ticker) => (
                <button
                  key={ticker}
                  className={`chart-selector-btn ${selectedTicker === ticker ? "chart-selector-btn-active dot-blue" : ""}`}
                  onClick={() => setSelectedTicker(ticker)}
                >
                  {ticker}
                </button>
              ))}
            </div>
          </div>

          {selectedMarket && (
            <TradingViewChart symbol={selectedTicker} exchange="NASDAQ" />
          )}
        </section>

        {/* ── Overall Market Overview ── */}
        <section className="card stat-card" style={{ padding: "32px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", marginBottom: "24px" }}>
            <div>
              <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 700 }}>Overall Market Overview</h2>
              <p className="chart-subtitle" style={{ margin: "6px 0 0" }}>
                AI-generated market-wide sentiment &amp; themes
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              {/* Sentiment badge */}
              <span style={{
                padding: "5px 16px",
                borderRadius: "999px",
                fontWeight: 700,
                fontSize: "13px",
                letterSpacing: "0.05em",
                background: overview.sentiment === "Bullish"
                  ? "rgba(34,197,94,0.15)"
                  : overview.sentiment === "Bearish"
                  ? "rgba(239,68,68,0.15)"
                  : "rgba(245,158,11,0.15)",
                border: `1px solid ${overview.sentiment === "Bullish" ? "rgba(34,197,94,0.4)" : overview.sentiment === "Bearish" ? "rgba(239,68,68,0.4)" : "rgba(245,158,11,0.4)"}`,
                color: overview.sentiment === "Bullish" ? "#22c55e" : overview.sentiment === "Bearish" ? "#ff6b6b" : "#f59e0b",
              }}>
                {overview.sentiment}
              </span>

              {/* Risk badge */}
              <span style={{
                padding: "5px 16px",
                borderRadius: "999px",
                fontWeight: 600,
                fontSize: "13px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid #333",
                color: overview.riskLevel === "High" ? "#ff6b6b" : overview.riskLevel === "Low" ? "#22c55e" : "#f59e0b",
              }}>
                {overview.riskLevel} Risk
              </span>
            </div>
          </div>

          {/* Summary */}
          <p style={{ margin: "0 0 24px", fontSize: "15px", lineHeight: "1.7", color: "#d1d5db" }}>
            {overview.summary}
          </p>

          {/* Sector Trends */}
          <div style={{ marginBottom: "24px" }}>
            <div style={{ fontSize: "13px", fontWeight: 600, color: "#9ca3af", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Key Sector Trends
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {overview.sectorTrends.map((trend, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "14px", color: "#d1d5db" }}>
                  <span style={{ color: "#3b82f6", marginTop: "2px", flexShrink: 0 }}>▸</span>
                  {trend}
                </div>
              ))}
            </div>
          </div>

          {/* Key Takeaway */}
          <div style={{ padding: "14px 18px", borderRadius: "12px", background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#3b82f6", textTransform: "uppercase", letterSpacing: "0.06em" }}>Key Takeaway  </span>
            <span style={{ fontSize: "14px", color: "#d1d5db" }}>{overview.keyTakeaway}</span>
          </div>
        </section>

        <section className="card analysis-card">
          <div className="analysis-header">
            <div>
              <h2>Top 10 Market Opportunities</h2>
              <p className="chart-subtitle">
                AI-powered analysis — Powered by Ollama
              </p>
            </div>

            <button
              className="analyze-btn"
              onClick={handleAnalyze}
              disabled={isAnalyzing || dataLoading}
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
                  Analyze Market
                </>
              )}
            </button>
          </div>

          {analysisError && (
            <div className="analysis-error">{analysisError}</div>
          )}

          <div className="analysis-context">
            <span className="context-chip">
              <span className="blue-text">Stocks analyzed:</span>{" "}
              {dataLoading ? "loading…" : allTickers.length}
            </span>
            <span className="context-chip">
              <span className="green-text">Recommendations:</span> Top 10
            </span>
            <span className="context-chip">
              <span className="orange-text">Model:</span> llama3.2 (local)
            </span>
          </div>

          <div className="portfolio-divider" style={{ marginBottom: 0 }} />

          <div className="recommendations-list">
            {recommendations.map((rec, idx) => (
              <div className="recommendation-item" key={rec.ticker}>
                <div className="rec-top">
                  <div className="rec-identity">
                    <span className="holding-dot" style={{ background: "#3b82f6" }} />
                    <div>
                      <span className="holding-ticker">#{idx + 1} {rec.ticker}</span>
                      <span className="holding-name"> — {marketData[rec.ticker]?.companyName || "Opportunity"}</span>
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
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default MarketAnalysis;
