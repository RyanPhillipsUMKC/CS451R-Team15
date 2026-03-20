import { useState } from "react";
import { Link } from "react-router-dom";
import { FaGithub } from "react-icons/fa";
//import StarsCanvas from "./StarsCanvas";

export default function LandingPage() {
  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Welcome</h1>
        <p style={styles.subtitle}>Start by logging into your account</p>

        <Link to="/signin" style={styles.link}>
          <button style={styles.button}>Go to Login</button>
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
    width: 380,
    padding: 36,
    borderRadius: 16,
    background: "rgba(20, 20, 25, 0.65)",
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
    opacity: 0.5,
    textAlign: "center",
    marginTop: 6,
  },
};