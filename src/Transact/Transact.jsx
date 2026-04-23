import { useEffect, useMemo, useState } from "react";
import AppHeader from "../Header/Header";
import { UserAuth } from "../authContext";
import { supabase } from "../supabaseClient";
import "../Dashboard/DashboardStyle.css";
import "../Login/LoginAndRegisterStyle.css";

export default function TransactPage() {
  const { user, getLiveMarketData, getUserFinancialSummary } = UserAuth();

  const [startingFundsAmount, setStartingFundsAmount] = useState("");

  const [ticker, setTicker] = useState("");
  const [tickerSearch, setTickerSearch] = useState("");
  const [showTickerResults, setShowTickerResults] = useState(false);

  const [type, setType] = useState("buy");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [customPrice, setCustomPrice] = useState("");

  const [liveMarketData, setLiveMarketData] = useState({});
  const [loadingMarketData, setLoadingMarketData] = useState(true);

  const [fundsMessage, setFundsMessage] = useState("");
  const [txMessage, setTxMessage] = useState("");

  const [loadingFunds, setLoadingFunds] = useState(false);
  const [loadingTx, setLoadingTx] = useState(false);

  useEffect(() => {
    async function loadMarketData() {
      setLoadingMarketData(true);

      const result = await getLiveMarketData();

      if (result.success) {
        setLiveMarketData(result.data ?? {});
      } else {
        console.error(result.error);
        setLiveMarketData({});
      }

      setLoadingMarketData(false);
    }

    loadMarketData();
  }, [getLiveMarketData]);

  const availableStocks = useMemo(() => {
    return Object.values(liveMarketData)
      .map((stock) => ({
        ticker: stock.ticker,
        company_name: stock.companyName,
        currentPrice: stock.currentPrice,
      }))
      .sort((a, b) => a.ticker.localeCompare(b.ticker));
  }, [liveMarketData]);

  const filteredStocks = useMemo(() => {
    const search = tickerSearch.trim().toLowerCase();

    if (!search) return [];

    return availableStocks
      .filter((stock) => {
        return (
          stock.ticker.toLowerCase().includes(search) ||
          String(stock.company_name || "").toLowerCase().includes(search)
        );
      })
      .slice(0, 10);
  }, [availableStocks, tickerSearch]);

  function handleSelectStock(stock) {
    setTicker(stock.ticker);
    setTickerSearch(
      stock.company_name?.trim()
        ? `${stock.ticker} - ${stock.company_name}`
        : stock.ticker
    );
    setPrice(String(stock.currentPrice ?? ""));
    setCustomPrice("");
    setShowTickerResults(false);
    setTxMessage("");
  }

  async function handleAddStartingFunds(e) {
    e.preventDefault();
    setFundsMessage("");

    const userId = user?.id;
    const amountToAdd = Number(startingFundsAmount);

    if (!userId) {
      setFundsMessage("No authenticated user found.");
      return;
    }

    if (Number.isNaN(amountToAdd) || amountToAdd === 0) {
      setFundsMessage("Please enter a valid positive or negative amount.");
      return;
    }

    setLoadingFunds(true);

    try {
      const { data: profile, error: profileError } = await supabase
        .from("Profiles")
        .select("starting_funds")
        .eq("id", userId)
        .single();

      if (profileError) {
        setFundsMessage(
          profileError.message || "Could not load current starting funds."
        );
        setLoadingFunds(false);
        return;
      }

      const currentStartingFunds = Number(profile?.starting_funds ?? 0);
      const newStartingFunds = currentStartingFunds + amountToAdd;

      if (newStartingFunds < 0) {
        setFundsMessage("Withdrawal would make starting funds go below $0.00.");
        setLoadingFunds(false);
        return;
      }

      const { error: updateError } = await supabase
        .from("Profiles")
        .update({ starting_funds: newStartingFunds })
        .eq("id", userId);

      if (updateError) {
        setFundsMessage(
          updateError.message || "Failed to update starting funds."
        );
        setLoadingFunds(false);
        return;
      }

      setFundsMessage(
        `${amountToAdd >= 0 ? "Added" : "Withdrew"} $${Math.abs(
          amountToAdd
        ).toFixed(2)}. New starting funds total: $${newStartingFunds.toFixed(2)}`
      );

      setStartingFundsAmount("");
    } catch (error) {
      setFundsMessage(
        error?.message || "Unexpected error updating starting funds."
      );
    }

    setLoadingFunds(false);
  }

  async function handleCreateTransaction(e) {
    e.preventDefault();
    setTxMessage("");

    const userId = user?.id;
    const normalizedTicker = ticker.trim().toUpperCase();
    const numericQuantity = Number(quantity);
    const numericPrice = customPrice ? Number(customPrice) : Number(price);

    if (!userId) {
      setTxMessage("No authenticated user found.");
      return;
    }

    if (!normalizedTicker || !type) {
      setTxMessage("Please select a stock.");
      return;
    }

    if (Number.isNaN(numericQuantity) || numericQuantity <= 0) {
      setTxMessage("Please enter a valid quantity greater than 0.");
      return;
    }

    if (Number.isNaN(numericPrice) || numericPrice <= 0) {
      setTxMessage("Please enter a valid price.");
      return;
    }

    setLoadingTx(true);

    try {
      const totalTransactionCost = numericQuantity * numericPrice;

      const summaryResult = await getUserFinancialSummary();

      if (!summaryResult.success) {
        setTxMessage(summaryResult.error || "Could not check account balance.");
        setLoadingTx(false);
        return;
      }

      const cashBalance = Number(summaryResult.data?.cashBalance ?? 0);
      const holdings = summaryResult.data?.holdings ?? {};
      const currentHolding = holdings[normalizedTicker];

      if (type === "buy" && totalTransactionCost > cashBalance) {
        setTxMessage(
          `Not enough cash. This buy costs $${totalTransactionCost.toFixed(
            2
          )}, but you only have $${cashBalance.toFixed(2)} available.`
        );
        setLoadingTx(false);
        return;
      }

      if (type === "sell") {
        const ownedShares = Number(currentHolding?.shares ?? 0);

        if (numericQuantity > ownedShares) {
          setTxMessage(
            `Not enough shares. You are trying to sell ${numericQuantity} share(s), but you only own ${ownedShares}.`
          );
          setLoadingTx(false);
          return;
        }
      }

      const { data: stockRow, error: stockError } = await supabase
        .from("Stocks")
        .select("id, ticker, company_name")
        .eq("ticker", normalizedTicker)
        .single();

      if (stockError || !stockRow) {
        setTxMessage(
          `Stock row for ${normalizedTicker} was not found in the Stocks table.`
        );
        setLoadingTx(false);
        return;
      }

      const { error: txError } = await supabase.from("Transactions").insert({
        user_id: userId,
        stock_id: stockRow.id,
        type,
        quantity: numericQuantity,
        price: numericPrice,
      });

      if (txError) {
        setTxMessage(txError.message || "Failed to create transaction.");
        setLoadingTx(false);
        return;
      }

      setTxMessage(
        `Created ${type} transaction: ${numericQuantity} share(s) of ${normalizedTicker} at $${numericPrice.toFixed(
          2
        )}`
      );

      setQuantity("");
      setCustomPrice("");
      setType("buy");
    } catch (error) {
      setTxMessage(error?.message || "Unexpected error creating transaction.");
    }

    setLoadingTx(false);
  }

  return (
    <div className="app">
      <AppHeader />

      <section className="hero" style={{ padding: "32px 3vw 0" }}>
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
            <path d="M12 3v18" />
            <path d="M17 8c0-2.2-2.2-4-5-4S7 5.8 7 8s2.2 4 5 4 5 1.8 5 4-2.2 4-5 4-5-1.8-5-4" />
          </svg>
        </div>

        <div>
          <h1>Transact</h1>
          <p>Deposit or withdraw funds and trade ETFs and stocks.</p>
        </div>
      </section>

      <main className="main-content">
        <section className="summary-grid">
          <div className="card stat-card">
            <h2 style={{ marginTop: 0 }}>Starting Funds Adjustment</h2>

            <form
              onSubmit={handleAddStartingFunds}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "14px",
                marginTop: "20px",
              }}
            >
              <label>
                <div style={{ marginBottom: "6px", color: "#9ca3af" }}>
                  Deposit / Withdraw
                </div>
                <input
                  type="number"
                  step="0.01"
                  value={startingFundsAmount}
                  onChange={(e) => setStartingFundsAmount(e.target.value)}
                  className="auth-input"
                  placeholder="1000.00"
                />
              </label>

              <button className="auth-button" disabled={loadingFunds}>
                {loadingFunds ? "Adding..." : "Add Starting Funds"}
              </button>

              {fundsMessage && (
                <div className="auth-hint" style={{ textAlign: "left" }}>
                  {fundsMessage}
                </div>
              )}
            </form>
          </div>

          <div className="card stat-card">
            <h2 style={{ marginTop: 0 }}>Trade ETFs and stocks</h2>

            <form
              onSubmit={handleCreateTransaction}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "14px",
                marginTop: "20px",
              }}
            >
              <label style={{ position: "relative" }}>
                <div style={{ marginBottom: "6px", color: "#9ca3af" }}>
                  Search Ticker
                </div>

                <input
                  type="text"
                  value={tickerSearch}
                  onChange={(e) => {
                    setTickerSearch(e.target.value);
                    setTicker("");
                    setPrice("");
                    setCustomPrice("");
                    setShowTickerResults(true);
                  }}
                  onFocus={() => setShowTickerResults(true)}
                  className="auth-input"
                  placeholder={
                    loadingMarketData
                      ? "Loading market data..."
                      : "Search AAPL, Apple, MSFT..."
                  }
                  disabled={loadingMarketData}
                />

                {showTickerResults && filteredStocks.length > 0 && (
                  <div
                    style={{
                      position: "absolute",
                      zIndex: 20,
                      top: "72px",
                      left: 0,
                      right: 0,
                      maxHeight: "260px",
                      overflowY: "auto",
                      background: "#11141a",
                      border: "1px solid #333",
                      borderRadius: "12px",
                      boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
                    }}
                  >
                    {filteredStocks.map((stock) => (
                      <button
                        key={stock.ticker}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleSelectStock(stock)}
                        style={{
                          width: "100%",
                          padding: "12px 14px",
                          border: "none",
                          borderBottom: "1px solid #333",
                          background: "transparent",
                          color: "#ffffff",
                          textAlign: "left",
                          cursor: "pointer",
                        }}
                      >
                        <div style={{ fontWeight: 700 }}>
                          {stock.ticker} - $
                          {Number(stock.currentPrice).toFixed(2)}
                        </div>
                        {stock.company_name?.trim() && (
                          <div
                            style={{
                              color: "#9ca3af",
                              fontSize: "13px",
                              marginTop: "4px",
                            }}
                          >
                            {stock.company_name}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </label>

              <label>
                <div style={{ marginBottom: "6px", color: "#9ca3af" }}>
                  Transaction Type
                </div>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="auth-input"
                >
                  <option value="buy">buy</option>
                  <option value="sell">sell</option>
                </select>
              </label>

              <label>
                <div style={{ marginBottom: "6px", color: "#9ca3af" }}>
                  Quantity
                </div>
                <input
                  type="number"
                  step="1"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="auth-input"
                  placeholder="10"
                />
              </label>

              <div style={{ display: "flex", gap: "12px" }}>
                <label style={{ flex: 1 }}>
                  <div style={{ marginBottom: "6px", color: "#9ca3af" }}>
                    Live Price Per Share
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={price}
                    readOnly
                    className="auth-input"
                    placeholder="Select a stock first"
                    style={{
                      opacity: 0.85,
                      cursor: "not-allowed",
                    }}
                  />
                </label>

                <label style={{ flex: 1 }}>
                  <div style={{ marginBottom: "6px", color: "#9ca3af" }}>
                    Custom Price Per Share
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={customPrice}
                    onChange={(e) => setCustomPrice(e.target.value)}
                    className="auth-input"
                    placeholder="Optional test price"
                  />
                </label>
              </div>

              {ticker && (
                <div className="auth-hint" style={{ textAlign: "left" }}>
                  Using {customPrice ? "custom" : "live"} price: $
                  {Number(customPrice || price || 0).toFixed(2)} per share.
                </div>
              )}

              <button
                className="auth-button"
                disabled={loadingTx || loadingMarketData || !ticker}
              >
                {loadingTx ? "Creating..." : "Create Transaction"}
              </button>

              {txMessage && (
                <div className="auth-hint" style={{ textAlign: "left" }}>
                  {txMessage}
                </div>
              )}
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}