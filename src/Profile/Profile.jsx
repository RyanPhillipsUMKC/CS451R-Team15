import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

export default function Profile({ user, onLogout }) {
  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [glowIntensity, setGlowIntensity] = useState(20);

  // Canvas reference
  const canvasRef = useRef(null);
  const drawing = useRef(false);

  // Animate card glow
  useEffect(() => {
    const interval = setInterval(() => {
      setGlowIntensity((prev) => (prev >= 35 ? 20 : prev + 1));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Setup canvas
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

    // Mouse events
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

  if (!user) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <h2>Loading profile...</h2>
        </div>
      </div>
    );
  }

  const handleResetPassword = () => {
    setMessage("");

    if (currentPassword !== user.password) {
      setMessage("Current password is incorrect.");
      return;
    }

    if (newPassword.length < 4) {
      setMessage("New password must be at least 4 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("New password and confirm password do not match.");
      return;
    }

    user.password = newPassword; // Update mock password
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setMessage("Password successfully updated!");
  };

  const getGlow = (text) => {
    const intensity = Math.min(text.length * 3, 20);
    return `0 0 ${intensity}px #38b2ac, 0 0 ${intensity * 2}px #3b82f6`;
  };

  return (
    <div style={styles.page}>
      {/* Drawing Canvas Background */}
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 0,
        }}
      ></canvas>

      <div
        style={{
          ...styles.card,
          boxShadow: `0 0 ${glowIntensity}px #3b82f6, 0 0 ${glowIntensity * 2}px #38b2ac`,
          zIndex: 1,
        }}
      >
        <h1 style={styles.title}>User Profile</h1>

        <div style={styles.field}>
          <label>Email</label>
          <input type="text" value={user.email} readOnly style={styles.input} />
        </div>

        <div style={styles.field}>
          <label>Password</label>
          <div style={styles.passwordWrapper}>
            <input
              type={showPassword ? "text" : "password"}
              value={user.password}
              readOnly
              style={styles.input}
            />
            <button
              style={{
                ...styles.eyeButton,
                transform: showPassword ? "rotateY(180deg)" : "rotateY(0deg)",
              }}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "🔓" : "🔒"}
            </button>
          </div>
        </div>

        <div style={styles.field}>
          <label>Current Password</label>
          <input
            type="password"
            placeholder="Enter current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            style={{ ...styles.input, boxShadow: getGlow(currentPassword) }}
          />

          <label>New Password</label>
          <input
            type="password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            style={{ ...styles.input, boxShadow: getGlow(newPassword) }}
          />

          <label>Confirm New Password</label>
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={{ ...styles.input, boxShadow: getGlow(confirmPassword) }}
          />

          <button
            style={styles.resetButton}
            onMouseEnter={(e) =>
              (e.currentTarget.style.boxShadow =
                "0 0 10px #38b2ac, 0 0 20px #4fd1c5")
            }
            onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
            onClick={handleResetPassword}
          >
            Reset Password
          </button>

          {message && <div style={styles.message}>{message}</div>}
        </div>

        <Link
          to="/dashboard"
          style={styles.backButton}
          onMouseEnter={(e) =>
            (e.currentTarget.style.boxShadow =
              "0 0 10px #3b82f6, 0 0 20px #38bdf8")
          }
          onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
        >
          Back to Dashboard
        </Link>

        <button
          style={styles.logoutButton}
          onMouseEnter={(e) =>
            (e.currentTarget.style.boxShadow =
              "0 0 10px #f56565, 0 0 20px #fc8181")
          }
          onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
          onClick={onLogout}
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
    textShadow: "0 0 5px #3b82f6, 0 0 15px #38b2ac",
  },

  field: { display: "flex", flexDirection: "column", gap: 8 },

  input: {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #3b82f6",
    background: "#0f1115",
    color: "white",
    width: "100%",
    transition: "box-shadow 0.3s, border-color 0.3s",
  },

  passwordWrapper: { display: "flex", alignItems: "center", gap: 8 },

  eyeButton: {
    padding: "8px 12px",
    borderRadius: "8px",
    border: "none",
    background: "#3b82f6",
    cursor: "pointer",
    transition: "transform 0.3s, box-shadow 0.3s",
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
    transition: "box-shadow 0.3s",
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
    transition: "box-shadow 0.3s",
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
    transition: "box-shadow 0.3s",
  },

  message: {
    marginTop: 6,
    fontSize: 14,
    color: "#48bb78",
    fontWeight: 500,
  },
};