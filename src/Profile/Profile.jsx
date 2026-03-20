import { Link } from "react-router-dom";

export default function Profile() {
  let user = {};
  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1>User Profile</h1>

        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>

        <Link to="/dashboard" style={styles.link}>
          Back to Dashboard
        </Link>
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
  link: {
    display: "inline-block",
    marginTop: 20,
    color: "#3b82f6",
    textDecoration: "none",
    fontWeight: 600
  }
};