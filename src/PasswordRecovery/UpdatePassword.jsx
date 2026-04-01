import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserAuth } from "../authContext";
import "../Login/LoginAndRegisterStyle.css";

export default function UpdatePasswordPage() {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();
  const { verifyRecoveryOtp, updatePassword, session } = UserAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!email || !token || !password || !confirmPassword) {
      setError("Please fill out all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    if (!session) {
      const verifyResult = await verifyRecoveryOtp(email, token);

      if (!verifyResult.success) {
        setError(verifyResult.error?.message || "Invalid or expired code.");
        setLoading(false);
        return;
      }
    }

    const updateResult = await updatePassword(password);

    if (!updateResult.success) {
      setError(updateResult.error?.message || "Unable to update password.");
      setLoading(false);
      return;
    }

    setMessage("Password updated successfully.");

    setTimeout(() => {
      navigate("/dashboard", { replace: true });
    }, 1000);

    setLoading(false);
  }

  return (
    <div className="auth-page">
      <form onSubmit={handleSubmit} className="auth-card">
        <div className="auth-header">
          <div className="auth-kicker">Password Recovery</div>
          <h1 className="auth-title">Set a New Password</h1>
          <p className="auth-subtitle">
            Enter the email, recovery code, and your new password.
          </p>
        </div>

        <label className="auth-label">
          Email
          <input
            type="email"
            className="auth-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </label>

        <label className="auth-label">
          Recovery Code
          <input
            type="text"
            className="auth-input"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="123456"
          />
        </label>

        <label className="auth-label">
          New Password
          <input
            type="password"
            className="auth-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </label>

        <label className="auth-label">
          Confirm Password
          <input
            type="password"
            className="auth-input"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
          />
        </label>

        {error && <div className="auth-error">{error}</div>}
        {message && <div className="auth-success">{message}</div>}

        <button disabled={loading} className="auth-button">
          {loading ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
}