import { useEffect, useMemo, useState } from "react";
import AppHeader from "../Header/Header";
import { UserAuth } from "../authContext";
import { useNavigate } from "react-router-dom";
import "../Dashboard/DashboardStyle.css";
import "../Login/LoginAndRegisterStyle.css";

export default function Profile() {
  const {
    user,
    getUserProfile,
    getUserFinancialSummary,
    getUserTransactions,
  } = UserAuth();

  const [profile, setProfile] = useState(null);
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    async function loadProfilePage() {
      setLoading(true);
      setMessage("");

      try {
        const [profileResult, summaryResult, transactionsResult] =
          await Promise.all([
            getUserProfile(),
            getUserFinancialSummary(),
            getUserTransactions(),
          ]);

        if (profileResult?.success) {
          setProfile(profileResult.data);
        } else {
          setProfile(null);
        }

        if (summaryResult?.success) {
          setSummary(summaryResult.data);
        } else {
          setSummary(null);
        }

        if (transactionsResult?.success) {
          setTransactions(transactionsResult.data || []);
        } else {
          setTransactions([]);
        }

        if (!profileResult?.success && !summaryResult?.success) {
          setMessage("Could not load profile data.");
        }
      } catch (error) {
        console.error(error);
        setMessage("Unexpected error loading profile page.");
      }

      setLoading(false);
    }

    loadProfilePage();
  }, [getUserProfile, getUserFinancialSummary, getUserTransactions]);

  const metadata = user?.user_metadata || {};
  const holdingsCount = Object.keys(summary?.holdings || {}).length;
  const transactionCount = transactions.length;

  const fullName = `${metadata?.first_name || ""} ${metadata?.last_name || ""}`.trim();

  const formattedCreatedAt = useMemo(() => {
    const rawDate = profile?.created_at || user?.created_at;
    if (!rawDate) return "N/A";

    return new Date(rawDate).toLocaleString();
  }, [profile?.created_at, user?.created_at]);

  const formattedLastSignIn = useMemo(() => {
    const rawDate = user?.last_sign_in_at;
    if (!rawDate) return "N/A";

    return new Date(rawDate).toLocaleString();
  }, [user?.last_sign_in_at]);

  function formatCurrency(value) {
    return `$${Number(value || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  function escapeCsvValue(value) {
    const stringValue =
      value === null || value === undefined ? "" : String(value);
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  function buildCsvContent() {
    const rows = [];

    rows.push(["Profile Field", "Value"]);
    rows.push(["User ID", user?.id || ""]);
    rows.push(["Email", user?.email || ""]);
    rows.push(["First Name", metadata?.first_name || ""]);
    rows.push(["Last Name", metadata?.last_name || ""]);
    rows.push(["Created At", profile?.created_at || user?.created_at || ""]);
    rows.push(["Last Sign In", user?.last_sign_in_at || ""]);
    rows.push(["Starting Funds", summary?.startingFunds ?? ""]);
    rows.push(["Cash Balance", summary?.cashBalance ?? ""]);
    rows.push(["Total Buy Cost", summary?.totalBuyCost ?? ""]);
    rows.push(["Total Sell Proceeds", summary?.totalSellProceeds ?? ""]);
    rows.push(["Open Holdings Count", holdingsCount]);
    rows.push(["Transaction Count", transactionCount]);
    rows.push([]);

    rows.push(["Transactions"]);
    rows.push([
      "Created At",
      "Ticker",
      "Company",
      "Type",
      "Quantity",
      "Price",
      "Total",
    ]);

    transactions.forEach((tx) => {
      const quantity = Number(tx?.quantity || 0);
      const price = Number(tx?.price || 0);

      rows.push([
        tx?.created_at || "",
        tx?.Stocks?.ticker || "",
        tx?.Stocks?.company_name || "",
        tx?.type || "",
        quantity,
        price,
        quantity * price,
      ]);
    });

    return rows
      .map((row) => row.map((cell) => escapeCsvValue(cell)).join(","))
      .join("\n");
  }

  function handleExportCsv() {
    const confirmed = window.confirm(
      "Do you want to export your profile and transaction data to a CSV file?"
    );

    if (!confirmed) return;

    try {
      const csvContent = buildCsvContent();
      const blob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8;",
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const safeName = fullName
        ? fullName.toLowerCase().replace(/\s+/g, "_")
        : "user";

      link.href = url;
      link.setAttribute("download", `${safeName}_profile_data.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setMessage("CSV exported successfully.");
    } catch (error) {
      console.error(error);
      setMessage("Failed to export CSV.");
    }
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
            <path d="M20 21a8 8 0 0 0-16 0" />
            <circle cx="12" cy="8" r="4" />
          </svg>
        </div>

        <div>
          <h1>Profile</h1>
          <p>View your account information, portfolio summary, and export your data.</p>
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
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 20a8 8 0 0 1 16 0" />
                </svg>
              </span>
              <span>Account Details</span>
            </div>

            <div style={{ marginTop: "22px", display: "grid", gap: "14px" }}>
              <div>
                <div className="portfolio-label">Full Name</div>
                <div className="portfolio-value" style={{ fontSize: "24px" }}>
                  {fullName || "N/A"}
                </div>
              </div>

              <div>
                <div className="portfolio-label">Email</div>
                <div className="holding-value">{user?.email || "N/A"}</div>
              </div>

              <div>
                <div className="portfolio-label">User ID</div>
                <div
                  className="holding-name"
                  style={{ wordBreak: "break-all", marginTop: "8px" }}
                >
                  {user?.id || "N/A"}
                </div>
              </div>

              <div>
                <div className="portfolio-label">Account Created</div>
                <div className="holding-value">{formattedCreatedAt}</div>
              </div>

              <div>
                <div className="portfolio-label">Last Sign In</div>
                <div className="holding-value">{formattedLastSignIn}</div>
              </div>

              <div>
                <button
                  className="danger-button"
                  onClick={() => navigate("/forgotpassword")}
                >
                  Reset Password
                </button>
              </div>

            </div>
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
                  <path d="M4 12h16" />
                  <path d="M12 4v16" />
                </svg>
              </span>
              <span>Export Data</span>
            </div>

            <div className="stat-subtitle" style={{ marginTop: "20px" }}>
              Download your account profile and transaction history as a CSV file.
            </div>

            <button
              className="auth-button"
              onClick={handleExportCsv}
              style={{ marginTop: "22px", width: "100%" }}
              disabled={loading}
            >
              Export My Data to CSV
            </button>

            <div className="auth-hint" style={{ marginTop: "14px", textAlign: "left" }}>
              You will be asked to confirm before the CSV is generated.
            </div>

            {message && (
              <div
                className="auth-hint"
                style={{ marginTop: "14px", textAlign: "left" }}
              >
                {message}
              </div>
            )}
          </div>
        </section>

        <section className="card portfolio-card">
          <div className="portfolio-top">
            <h2>Financial Summary</h2>

            <div className="portfolio-stats">
              <div>
                <div className="portfolio-label">Starting Funds</div>
                <div className="portfolio-value">
                  {loading ? "Loading..." : formatCurrency(summary?.startingFunds)}
                </div>
              </div>

              <div>
                <div className="portfolio-label">Cash Balance</div>
                <div className="portfolio-value">
                  {loading ? "Loading..." : formatCurrency(summary?.cashBalance)}
                </div>
              </div>

              <div>
                <div className="portfolio-label">Open Holdings</div>
                <div className="portfolio-value">
                  {loading ? "Loading..." : holdingsCount}
                </div>
              </div>

              <div>
                <div className="portfolio-label">Transactions</div>
                <div className="portfolio-value">
                  {loading ? "Loading..." : transactionCount}
                </div>
              </div>
            </div>
          </div>

          <div className="portfolio-divider" />

          <div className="portfolio-bottom" style={{ gridTemplateColumns: "1fr 1fr" }}>
            <div className="allocation-section">
              <h3>Profile Data</h3>

              <div className="holdings-list">
                <div className="holding-row">
                  <div>
                    <div className="holding-ticker">First Name</div>
                    <div className="holding-name">{metadata?.first_name || "N/A"}</div>
                  </div>
                </div>

                <div className="holding-row">
                  <div>
                    <div className="holding-ticker">Last Name</div>
                    <div className="holding-name">{metadata?.last_name || "N/A"}</div>
                  </div>
                </div>

                <div className="holding-row">
                  <div>
                    <div className="holding-ticker">Email Verified</div>
                    <div className="holding-name">
                      {user?.email_confirmed_at ? "Yes" : "No"}
                    </div>
                  </div>
                </div>

                <div className="holding-row">
                  <div>
                    <div className="holding-ticker">Starting Funds</div>
                    <div className="holding-name">
                      {formatCurrency(profile?.starting_funds)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="holdings-section">
              <h3>Recent Transactions</h3>

              <div className="holdings-list">
                {loading ? (
                  <div className="holding-row">Loading transactions...</div>
                ) : transactions.length === 0 ? (
                  <div className="holding-row">No transactions found.</div>
                ) : (
                  transactions.slice(0, 5).map((tx) => {
                    const quantity = Number(tx?.quantity || 0);
                    const price = Number(tx?.price || 0);
                    const total = quantity * price;

                    return (
                      <div className="holding-row" key={tx.id}>
                        <div className="holding-left">
                          <span
                            className={`holding-dot ${
                              tx.type === "buy" ? "dot-green" : "dot-red"
                            }`}
                          />
                          <div>
                            <div className="holding-ticker">
                              {tx?.Stocks?.ticker || "N/A"} - {tx?.type || "N/A"}
                            </div>
                            <div className="holding-name">
                              {tx?.Stocks?.company_name || "Unknown company"}
                            </div>
                          </div>
                        </div>

                        <div className="holding-right">
                          <div className="holding-value">{formatCurrency(total)}</div>
                          <div className="holding-change" style={{ color: "#9ca3af" }}>
                            {new Date(tx.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}