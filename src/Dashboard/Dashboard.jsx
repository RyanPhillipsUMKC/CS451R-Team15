import { Link } from "react-router-dom";

export default function Dashboard({ user, onLogout }) {
  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1>Dashboard</h1>

        <p>Welcome, <strong>{user.name}</strong></p>

        <Link to="/profile" style={styles.link}>
          Go to Profile
        </Link>

        <button onClick={onLogout} style={styles.button}>
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
  button: {
    marginTop: 20,
    padding: "10px 16px",
    borderRadius: 8,
    border: "none",
    background: "#ef4444",
    color: "white",
    fontWeight: 600,
    cursor: "pointer"
  }
};