import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaGithub } from "react-icons/fa";
import { UserAuth } from "../authContext";
import "./LoginAndRegisterStyle.css";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [agreeToTos, setAgreeToTos] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { signUpNewUser } = UserAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
  e.preventDefault();
  setError("");

  if (!fullName || !email || !password || !repeatPassword) {
    setError("Please enter all fields below.");
    return;
  }

  if (password !== repeatPassword) {
    setError("Passwords do not match.");
    return;
  }

  if (!agreeToTos) {
    setError("Must agree to the terms of service to create an account.");
    return;
  }

  setLoading(true);

  try {
    const result = await signUpNewUser(email, password);

    if (result?.error) {
      setError(result.error.message || "Failed to create account.");
    } else {
      navigate("/dashboard", { replace: true });
    }
  } catch (err) {
    setError(err.message || "An unexpected error occurred.");
  } finally {
    setLoading(false);
  }
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
          <div className="auth-kicker">Register</div>
          <h1 className="auth-title">Create an Account</h1>
          <p className="auth-subtitle">
            Fill out the fields below to create your account.
          </p>
        </div>

        <label className="auth-label">
          Full Name
          <input
            type="text"
            placeholder="John Doe"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="auth-input"
          />
        </label>

        <label className="auth-label">
          Email
          <input
            type="text"
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

        <label className="auth-label">
          Repeat Password
          <input
            type="password"
            placeholder="••••••••"
            value={repeatPassword}
            onChange={(e) => setRepeatPassword(e.target.value)}
            className="auth-input"
          />
        </label>

        <div className="auth-options">
          <label className="auth-checkbox">
            <input
              type="checkbox"
              checked={agreeToTos}
              onChange={() => setAgreeToTos(!agreeToTos)}
            />
            I agree to the terms of use
          </label>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <button disabled={loading} className="auth-button">
          {loading ? "Creating Account..." : "Create Account"}
        </button>

        <div className="auth-hint">
          Create your account to access the dashboard and portfolio tools.
        </div>

        <p className="auth-footer-text">
          Already have an account?{" "}
          <Link to="/signin" className="auth-text-link">
            Sign In
          </Link>
        </p>
      </form>
    </div>
  );
}