import { useState } from "react";
import AppHeader from "../Header/Header";
import { UserAuth } from "../authContext";
import { supabase } from "../supabaseClient";
import "../Dashboard/DashboardStyle.css";
import "../Login/LoginAndRegisterStyle.css";

const MOCK_TICKERS = [
  { ticker: "AAPL", company_name: "Apple Inc." },
  { ticker: "GOOGL", company_name: "Alphabet Inc." },
  { ticker: "MSFT", company_name: "Microsoft Corporation" },
  { ticker: "TSLA", company_name: "Tesla, Inc." },
  { ticker: "NVDA", company_name: "NVIDIA Corporation" },
];

export default function TransactPage() {
  const { user } = UserAuth();

  const [startingFundsAmount, setStartingFundsAmount] = useState("");

  const [ticker, setTicker] = useState("AAPL");
  const [type, setType] = useState("buy");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");

  const [fundsMessage, setFundsMessage] = useState("");
  const [txMessage, setTxMessage] = useState("");

  const [loadingFunds, setLoadingFunds] = useState(false);
  const [loadingTx, setLoadingTx] = useState(false);

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
        setFundsMessage(profileError.message || "Could not load current starting funds.");
        setLoadingFunds(false);
        return;
      }

      const currentStartingFunds = Number(profile?.starting_funds ?? 0);
      const newStartingFunds = currentStartingFunds + amountToAdd;

      // Optional safety check:
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
        setFundsMessage(updateError.message || "Failed to update starting funds.");
        setLoadingFunds(false);
        return;
      }

      setFundsMessage(
        `${amountToAdd >= 0 ? "Added" : "Withdrew"} $${Math.abs(amountToAdd).toFixed(2)}. New starting funds total: $${newStartingFunds.toFixed(2)}`
      );
      setStartingFundsAmount("");
    } catch (error) {
      setFundsMessage(error?.message || "Unexpected error updating starting funds.");
    }

    setLoadingFunds(false);
  }

  async function handleCreateTransaction(e) {
    e.preventDefault();
    setTxMessage("");

    const userId = user?.id;
    const numericQuantity = Number(quantity);
    const numericPrice = Number(price);

    if (!userId) {
      setTxMessage("No authenticated user found.");
      return;
    }

    if (!ticker || !type) {
      setTxMessage("Please select a ticker and transaction type.");
      return;
    }

    if (Number.isNaN(numericQuantity) || numericQuantity <= 0) {
      setTxMessage("Please enter a valid quantity greater than 0.");
      return;
    }

    if (Number.isNaN(numericPrice) || numericPrice <= 0) {
      setTxMessage("Please enter a valid price greater than 0.");
      return;
    }

    setLoadingTx(true);

    try {
      // Find stock row by ticker
      const { data: stockRow, error: stockError } = await supabase
        .from("Stocks")
        .select("id, ticker, company_name")
        .eq("ticker", ticker)
        .single();

      if (stockError || !stockRow) {
        setTxMessage(`Stock row for ${ticker} was not found in the Stocks table.`);
        setLoadingTx(false);
        return;
      }

      // Insert transaction
      const { error: txError } = await supabase
        .from("Transactions")
        .insert({
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
        `Created ${type} transaction: ${numericQuantity} share(s) of ${ticker} at $${numericPrice.toFixed(2)}`
      );

      setQuantity("");
      setPrice("");
      setType("buy");
      setTicker("AAPL");
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
          <p>Deposit or withdraw funds and trade ETFs and stocks. </p>
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
              <label>
                <div style={{ marginBottom: "6px", color: "#9ca3af" }}>Ticker</div>
                <select
                  value={ticker}
                  onChange={(e) => setTicker(e.target.value)}
                  className="auth-input"
                >
                  {MOCK_TICKERS.map((stock) => (
                    <option key={stock.ticker} value={stock.ticker}>
                      {stock.ticker} - {stock.company_name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <div style={{ marginBottom: "6px", color: "#9ca3af" }}>Transaction Type</div>
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
                <div style={{ marginBottom: "6px", color: "#9ca3af" }}>Quantity</div>
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

              <label>
                <div style={{ marginBottom: "6px", color: "#9ca3af" }}>Price Per Share</div>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="auth-input"
                  placeholder="182.50"
                />
              </label>

              <button className="auth-button" disabled={loadingTx}>
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