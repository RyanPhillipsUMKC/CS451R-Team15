import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./Login/Login.jsx";
import Dashboard from "./Dashboard/Dashboard.jsx";
import Profile from "./Profile/Profile.jsx";


export default function App() {
  const [user, setUser] = useState(null);
  function logout() {
    setUser(null);
  }

  if (!user) {
    return <LoginPage onLoginSuccess={setUser} />;
  }
  
  // TODO: for now just pass the mock user to the other pages
  // eventually we will need supabase auth with some sort of session that we can just reference
  return (
    <Routes>
      <Route
        path="/dashboard"
        element={<Dashboard user={user} onLogout={logout} />}
      />

      <Route
        path="/profile"
        element={<Profile user={user} />}
      />

      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}
