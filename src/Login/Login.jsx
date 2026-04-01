import { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { FaGithub } from "react-icons/fa";
import { UserAuth } from "../authContext";
import "./LoginAndRegisterStyle.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { signInUser } = UserAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await signInUser(email, password);

      if (!error) {
        navigate("/dashboard", { replace: true });
      } else {
        setError(error);
      }
    } catch (error) {
      setError(error?.message || "An unexpected error occurred.");
    }

    setLoading(false);
  }

  const { session } = UserAuth();

  if (session) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="auth-page">
      <a
        href="https://github.com/RyanPhillipsUMKC/CS451R-Team15"
        target="_blank"
        rel="noopener noreferrer"
        className="auth-github"
        aria-label="GitHub repository"
      >
        <FaGithub size={24} />
      </a>

      <form onSubmit={handleSubmit} className="auth-card">
        <div className="auth-header">
          <div className="auth-kicker">Sign In</div>
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">
            Sign in to access your dashboard, holdings, and charts.
          </p>
        </div>

        <label className="auth-label">
          Email
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="auth-input"
          />
        </label>

        <label className="auth-label">
          Password
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="auth-input"
          />
        </label>

        <div className="auth-options">
          <label className="auth-checkbox">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={() => setRememberMe(!rememberMe)}
            />
            Remember me
          </label>

          <Link to="/forgotpassword" className="auth-inline-link">
            Forgot password?
          </Link>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <button disabled={loading} className="auth-button">
          {loading ? "Signing in..." : "Login"}
        </button>

        <div className="auth-hint">
          Use your account credentials to continue.
        </div>

        <p className="auth-footer-text">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="auth-text-link">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
}