import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { UserAuth } from "../authContext";

export default function Profile({ onLogout }) {
  const { userEmail, userPassword, signOut } = UserAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [glowIntensity, setGlowIntensity] = useState(20);

  const canvasRef = useRef(null);
  const drawing = useRef(false);

  // Glow animation
  useEffect(() => {
    const interval = setInterval(() => {
      setGlowIntensity((prev) => (prev >= 35 ? 20 : prev + 1));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Canvas setup
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    const startDrawing = (e) => {
      drawing.current = true;
      ctx.beginPath();
      ctx.moveTo(e.clientX, e.clientY);
    };

    const draw = (e) => {
      if (!drawing.current) return;
      ctx.lineTo(e.clientX, e.clientY);
      ctx.strokeStyle = "#38b2ac";
      ctx.lineWidth = 2;
      ctx.shadowColor = "#3b82f6";
      ctx.shadowBlur = 6;
      ctx.stroke();
    };

    const stopDrawing = () => {
      drawing.current = false;
      ctx.closePath();
    };

    canvas.addEventListener("mousedown", startDrawing);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", stopDrawing);
    canvas.addEventListener("mouseout", stopDrawing);

    return () => {
      window.removeEventListener("resize", handleResize);
      canvas.removeEventListener("mousedown", startDrawing);
      canvas.removeEventListener("mousemove", draw);
      canvas.removeEventListener("mouseup", stopDrawing);
      canvas.removeEventListener("mouseout", stopDrawing);
    };
  }, []);

  // SAFE USER from context
  const safeUser = {
    email: userEmail || "guest@example.com",
    password: userPassword || "1234",
  };

  const handleResetPassword = () => {
    setMessage("");

    if (currentPassword !== safeUser.password) {
      setMessage("Current password is incorrect.");
      return;
    }

    if (newPassword.length < 4) {
      setMessage("New password must be at least 4 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setMessage("Password updated (demo only - not saved to Supabase)");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div style={styles.page}>
      <canvas ref={canvasRef} style={{ position: "absolute", top: 0, left: 0 }} />

      <div
        style={{
          ...styles.card,
          boxShadow: `0 0 ${glowIntensity}px #3b82f6, 0 0 ${glowIntensity * 2}px #38b2ac`,
        }}
      >
        <h1 style={styles.title}>User Profile</h1>

        {/* EMAIL */}
        <div style={styles.field}>
          <label>Email</label>
          <input type="text" value={safeUser.email} readOnly style={styles.input} />
        </div>

        {/* PASSWORD */}
        <div style={styles.field}>
          <label>Password</label>
          <div style={styles.passwordWrapper}>
            <input
              type={showPassword ? "text" : "password"}
              value={safeUser.password}
              readOnly
              style={styles.input}
            />
            <button
              style={styles.eyeButton}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "🔓" : "🔒"}
            </button>
          </div>
        </div>

        {/* RESET SECTION */}
        <div style={styles.field}>
          <label>Current Password</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            style={styles.input}
          />

          <label>New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            style={styles.input}
          />

          <label>Confirm Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={styles.input}
          />

          <button style={styles.resetButton} onClick={handleResetPassword}>
            Reset Password
          </button>

          {message && <div style={styles.message}>{message}</div>}
        </div>

        <Link to="/dashboard" style={styles.backButton}>
          Back to Dashboard
        </Link>

        <button
          style={styles.logoutButton}
          onClick={() => {
            signOut();
            if (onLogout) onLogout();
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    width: "100vw",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#0f1115",
    color: "white",
    fontFamily: "'Poppins', sans-serif",
    overflow: "hidden",
    position: "relative",
  },

  card: {
    position: "relative",
    width: 420,
    padding: 35,
    borderRadius: 16,
    background: "rgba(30, 33, 45, 0.95)",
    display: "flex",
    flexDirection: "column",
    gap: 20,
    border: "1px solid #3b82f6",
    transition: "transform 0.3s, box-shadow 0.3s",
  },

  title: {
    textAlign: "center",
    marginBottom: 15,
    fontSize: 30,
    fontWeight: 700,
    color: "#3b82f6",
  },

  field: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },

  input: {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #3b82f6",
    background: "#0f1115",
    color: "white",
    width: "100%",
  },

  passwordWrapper: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },

  eyeButton: {
    padding: "8px 12px",
    borderRadius: "8px",
    border: "none",
    background: "#3b82f6",
    cursor: "pointer",
  },

  backButton: {
    marginTop: 10,
    textAlign: "center",
    padding: "10px",
    background: "linear-gradient(90deg, #3b82f6, #38bdf8)",
    borderRadius: "8px",
    textDecoration: "none",
    color: "white",
    fontWeight: "600",
  },

  logoutButton: {
    marginTop: 10,
    padding: "10px",
    borderRadius: "8px",
    border: "none",
    background: "linear-gradient(90deg, #f56565, #fc8181)",
    color: "white",
    fontWeight: 600,
    cursor: "pointer",
  },

  resetButton: {
    marginTop: 6,
    padding: "10px",
    borderRadius: "8px",
    border: "none",
    background: "linear-gradient(90deg, #38b2ac, #4fd1c5)",
    color: "white",
    fontWeight: 600,
    cursor: "pointer",
  },

  message: {
    marginTop: 6,
    fontSize: 14,
    color: "#48bb78",
  },
};