import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { UserAuth } from "../authContext";

import "./HeaderStyle.css";

function AppHeader() {
  const [navMenuOpen, setNavMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const navMenuRef = useRef(null);
  const profileMenuRef = useRef(null);

  const navigate = useNavigate();
  const { session, signOut } = UserAuth();

  const displayName =
    session?.user?.user_metadata?.username ||
    session?.user?.user_metadata?.full_name ||
    session?.user?.email ||
    "Profile";

  useEffect(() => {
    function handleClickOutside(event) {
      if (navMenuRef.current && !navMenuRef.current.contains(event.target)) {
        setNavMenuOpen(false);
      }

      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setProfileMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  async function handleLogout() {
    setProfileMenuOpen(false);
    await signOut();
    navigate("/signin", { replace: true });
  }

  return (
    <header className="topbar">
      {/* LEFT NAV DROPDOWN */}
      <div className="topbar-left">
        <div className="nav-menu-anchor" ref={navMenuRef}>
          <button
            type="button"
            className="topbar-title-button"
            onClick={() => {
              setNavMenuOpen((prev) => !prev);
              setProfileMenuOpen(false);
            }}
          >
            <span>Investment Tracking Plugin</span>
            <span className="dropdown-arrow">▾</span>
          </button>

          <div className={`nav-dropdown ${navMenuOpen ? "open" : ""}`}>
            <Link
              to="/dashboard"
              className="nav-dropdown-link"
              onClick={() => setNavMenuOpen(false)}
            >
              Dashboard
            </Link>

            <Link
              to="/stockcharts"
              className="nav-dropdown-link"
              onClick={() => setNavMenuOpen(false)}
            >
              Charts
            </Link>

            <Link
              to="/portfolio"
              className="nav-dropdown-link"
              onClick={() => setNavMenuOpen(false)}
            >
              Portfolio Analysis
            </Link>
          </div>
        </div>
      </div>

      {/* PROFILE */}
      <div className="topbar-right">
        <div className="profile-menu-anchor" ref={profileMenuRef}>
          <button
            type="button"
            className="profile-button-combined"
            onClick={() => {
              setProfileMenuOpen((prev) => !prev);
              setNavMenuOpen(false);
            }}
          >
            <span className="profile-avatar">
              {(displayName?.[0] || "P").toUpperCase()}
            </span>

            <span className="profile-name">
              {displayName.split("@")[0]}
            </span>

            <span className="dropdown-arrow small">▾</span>
          </button>

          <div className={`profile-dropdown ${profileMenuOpen ? "open" : ""}`}>
            <Link
              to="/profile"
              className="profile-dropdown-link"
              onClick={() => setProfileMenuOpen(false)}
            >
              Profile
            </Link>

            <button
              type="button"
              className="profile-dropdown-logout"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default AppHeader;