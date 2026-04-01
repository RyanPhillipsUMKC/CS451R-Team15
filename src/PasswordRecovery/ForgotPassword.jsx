import { useState } from "react";
import { Link } from "react-router-dom";
import { FaGithub } from "react-icons/fa";
import { UserAuth } from "../authContext";
import "../Login/LoginAndRegisterStyle.css";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const { resetPassword } = UserAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await resetPassword(email);

      if (error) {
        setError(error.message || "Unable to send reset email.");
      } else {
        setMessage("Password reset email sent. Please check your inbox.");
      }
    } catch (error) {
      setError(error?.message || "An unexpected error occurred.");
    }

    setLoading(false);
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
          <div className="auth-kicker">Password Reset</div>
          <h1 className="auth-title">Forgot Password?</h1>
          <p className="auth-subtitle">
            Enter your email and we&apos;ll send you a password reset link.
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

        {error && <div className="auth-error">{error}</div>}
        {message && <div className="auth-success">{message}</div>}

        <button disabled={loading} className="auth-button">
          {loading ? "Sending..." : "Send Reset Email"}
        </button>

        <p className="auth-footer-text">
          Remembered your password?{" "}
          <Link to="/signin" className="auth-text-link">
            Back to login
          </Link>
        </p>
      </form>
    </div>
  );
}