import { Link } from "react-router-dom";
import "../Dashboard/DashboardStyle.css";
import AppHeader from "../Header/Header";

/* Hard Coded Charts until API is implemented */
function StockCharts() {
  const stocks = [
    { ticker: "AMZN", name: "Amazon.com Inc.", price: "$252.89", change: "+0.27%" },
    { ticker: "META", name: "Meta Platforms Inc.", price: "$138.21", change: "+0.15%" },
    { ticker: "JPM", name: "JPMorgan Chase & Co.", price: "$421.33", change: "+0.45%" },
    { ticker: "WMT", name: "Walmart Inc.", price: "$178.12", change: "-0.90%" },
  ];

  return (
    <div className="app">
      {/* Top bar */}
      <AppHeader />

      {/* Hero */}
      <section className="hero">
        <div>
          <h1>Stock Charts</h1>
          <p>Track major company performance</p>
        </div>
      </section>

      {/* Main */}
      <main className="main-content">
        <section className="card portfolio-card">
          <div className="portfolio-top">
            <h2>Top Stocks</h2>
          </div>

          <div className="portfolio-bottom">
            {/* Stock List */}
            <div className="holdings-section">
              <div className="holdings-list">
                {stocks.map((stock) => (
                  <div className="holding-row" key={stock.ticker}>
                    <div className="holding-left">
                      <div>
                        <div className="holding-ticker">{stock.ticker}</div>
                        <div className="holding-name">{stock.name}</div>
                      </div>
                    </div>

                    <div className="holding-right">
                      <div className="holding-value">{stock.price}</div>
                      <div
                        className={
                          stock.change.startsWith("-")
                            ? "holding-change red-text"
                            : "holding-change green-text"
                        }
                      >
                        {stock.change}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Fake Chart will be replaced later on with real chart once API is implemented */}
            <div className="allocation-section">
              <h3>Sample Chart</h3>

              <div
                style={{
                  height: "250px",
                  background: "linear-gradient(180deg, #3b82f6, #1a1d24)",
                  borderRadius: "20px",
                  marginTop: "20px",
                }}
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default StockCharts;