import { useState } from "react";

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

      // Save session (remove later if backend handles sessions)
      if (rememberMe) {
        // keep session going????
        //localStorage.setItem("user", JSON.stringify(user));
      }

      // notify app login succeeded
      onLoginSuccess(user);

    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  }

  return (
    <div style={styles.page}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <h2>Sign In</h2>
        <p style={{ opacity: 0.7 }}>Mock login for development</p>

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

        <label style={styles.checkbox}>
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={() => setRememberMe(!rememberMe)}
          />
          Remember me
        </label>

        {error && <div style={styles.error}>{error}</div>}

        <button disabled={loading} style={styles.button}>
          {loading ? "Signing in..." : "Login"}
        </button>

        <div style={styles.hint}>
          Use any email & password for now
        </div>
      </form>
    </div>
  );
}

/*
 MOCK AUTH FUNCTION
 Replace later with API call:
 await fetch('/api/login', {...})
*/
function mockAuthenticate(email, password) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      
      // Example failure case
      if (password.length < 4) {
        reject(new Error("Password must be at least 4 characters."));
        return;
      }

      resolve({
        id: 1,
        name: "Demo User",
        email,
        token: "mock-jwt-token"
      });
    }, 900); // simulate network delay
  });
}

const styles = {
   page: {
    minHeight: "100vh",
    width: "100vw",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#0f1115",
    color: "white"
  },
  card: {
    width: 360,
    padding: 28,
    borderRadius: 12,
    background: "#1a1d24",
    display: "flex",
    flexDirection: "column",
    gap: 12,
    boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
  },
  label: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    fontSize: 14
  },
  input: {
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #333",
    background: "#111",
    color: "white"
  },
  checkbox: {
    fontSize: 14,
    display: "flex",
    gap: 8,
    alignItems: "center"
  },
  button: {
    marginTop: 6,
    padding: "10px",
    borderRadius: 8,
    border: "none",
    background: "#3b82f6",
    color: "white",
    fontWeight: 600,
    cursor: "pointer"
  },
  error: {
    background: "#ff4d4f22",
    padding: 8,
    borderRadius: 6,
    color: "#ff6b6b",
    fontSize: 13
  },
  hint: {
    marginTop: 6,
    fontSize: 12,
    opacity: 0.6
  }
};