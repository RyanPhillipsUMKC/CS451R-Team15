import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./Login/Login.jsx";
import Dashboard from "./Dashboard/Dashboard.jsx";
import Profile from "./Profile/Profile.jsx";

export default function App() {
  const [user, setUser] = useState(null);

  const logout = () => {
    setUser(null);
  };

  if (!user) {
    return <LoginPage onLoginSuccess={setUser} />;
  }

  return (
    <Routes>
      <Route
        path="/dashboard"
        element={<Dashboard user={user} onLogout={logout} />}
      />

      <Route
        path="/profile"
        element={<Profile user={user} onLogout={logout} />}
      />

      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}