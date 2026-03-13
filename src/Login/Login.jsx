import { useState } from "react";
import { FaGithub, FaWallet, FaBitcoin } from "react-icons/fa";
import StarsCanvas from "./StarsCanvas";

export default function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }

    setLoading(true);

    try {
      const user = await mockAuthenticate(email, password);

      if (rememberMe) {
        // localStorage.setItem("user", JSON.stringify(user));
      }

      onLoginSuccess(user);
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  }

  return (
    <div style={styles.page}>
      <StarsCanvas />

      {/* GitHub */}
      <a
        href="https://github.com/RyanPhillipsUMKC/CS451R-Team15"
        target="_blank"
        rel="noopener noreferrer"
        style={styles.github}
      >
        <FaGithub size={28} />
      </a>

      {/* Login Card */}
      <form onSubmit={handleSubmit} style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>Welcome Back</h1>
          <p style={styles.subtitle}>Secure banking & crypto login</p>
          <div style={styles.icons}>
            <FaWallet size={22} color="#f5c518" />
            <FaBitcoin size={22} color="#f7931a" style={{ marginLeft: 12 }} />
          </div>
        </div>

        <label style={styles.label}>
          Email
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
          />
        </label>

        <label style={styles.label}>
          Password
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
          />
        </label>

        <div style={styles.options}>
          <label style={styles.checkbox}>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={() => setRememberMe(!rememberMe)}
            />
            Remember me
          </label>
          <span style={styles.forgot}>Forgot password?</span>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <button disabled={loading} style={styles.button}>
          {loading ? "Signing in..." : "Login"}
        </button>

        <div style={styles.hint}>
          Use any email & password for development.  
          Your mock account balance will be displayed after login.
        </div>
      </form>
    </div>
  );
}

// Mock authentication function with sample balance
function mockAuthenticate(email, password) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (password.length < 4) {
        reject(new Error("Password must be at least 4 characters."));
        return;
      }

      resolve({
        id: 1,
        name: "Demo User",
        email,
        token: "mock-jwt-token",
        balance: "$12,345.67",
        crypto: {
          BTC: "0.42",
          ETH: "3.18",
        },
      });
    }, 900);
  });
}

const styles = {
  page: {
    minHeight: "100vh",
    width: "100vw",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    color: "white",
    fontFamily: "Inter, sans-serif",
  },

  github: {
    position: "absolute",
    top: 25,
    right: 25,
    color: "white",
    opacity: 0.8,
    transition: "0.3s",
  },

  card: {
    width: 400,
    padding: 36,
    borderRadius: 16,
    background: "rgba(20, 20, 25, 0.75)",
    backdropFilter: "blur(12px)",
    display: "flex",
    flexDirection: "column",
    gap: 18,
    boxShadow: "0 15px 40px rgba(0,0,0,0.45)",
    border: "1px solid rgba(255,255,255,0.08)",
    zIndex: 10,
  },

  header: {
    textAlign: "center",
    marginBottom: 10,
  },

  title: {
    margin: 0,
    fontSize: 28,
    fontWeight: 600,
  },

  subtitle: {
    margin: 0,
    opacity: 0.6,
    fontSize: 14,
  },

  icons: {
    display: "flex",
    justifyContent: "center",
    marginTop: 8,
  },

  label: {
    display: "flex",
    flexDirection: "column",
    fontSize: 14,
    gap: 6,
  },

  input: {
    padding: "11px 14px",
    borderRadius: 8,
    border: "1px solid #2c2c2c",
    background: "#0e0e11",
    color: "white",
    fontSize: 14,
    outline: "none",
  },

  options: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  checkbox: {
    fontSize: 13,
    display: "flex",
    gap: 8,
    alignItems: "center",
  },

  forgot: {
    fontSize: 13,
    color: "#3b82f6",
    cursor: "pointer",
  },

  button: {
    marginTop: 8,
    padding: "12px",
    borderRadius: 8,
    border: "none",
    background: "linear-gradient(135deg,#3b82f6,#2563eb)",
    color: "white",
    fontWeight: 600,
    fontSize: 15,
    cursor: "pointer",
    transition: "0.2s",
  },

  error: {
    background: "#ff4d4f22",
    padding: 10,
    borderRadius: 6,
    color: "#ff6b6b",
    fontSize: 13,
  },

  hint: {
    fontSize: 12,
    opacity: 0.6,
    textAlign: "center",
    marginTop: 6,
  },
};