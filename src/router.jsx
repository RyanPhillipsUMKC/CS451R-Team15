import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import LoginPage from "./Login/Login";
import RegisterPage from "./Login/Register";
import Dashboard from "./Dashboard/Dashboard";
import Profile from "./Profile/Profile";
import PrivateRoute from "./PrivateRoute/PrivateRoute";
import StockCharts from "./StockCharts/StockCharts";
import Portfolio from "./Portfolio/Portfolio";
import ForgotPasswordPage from "./PasswordRecovery/ForgotPassword";
import UpdatePasswordPage from "./PasswordRecovery/UpdatePassword";
import RecoveryRoute from "./PasswordRecovery/RecoveryRoute";
import TransactPage from "./Transact/Transact";

export const router = createBrowserRouter([
  { path: "/", element: <App /> },
  { path: "/signin", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },

  // Password Recover / Update
  { path: "/forgotpassword", element: <ForgotPasswordPage /> },

  // supabase says to check for PASSWORD_RECOVERY state on auth state change to make sure password can only be reset once
  // however this event is never ommited and the condition in authContext is never hit.  Seems to be a known bug https://github.com/supabase/auth/issues/1948.
  // So, for now, a user who requests a password change can reset thier password multiple time wihtin the password reset link timer
  // by renavigating to the /updatepassword route.  Jank as hell but not a secuity risk because auth session from link is required and email token
  { path: "/updatepassword", 
    element: (
    //<RecoveryRoute>
      <UpdatePasswordPage />
    //</RecoveryRoute>
    ),
  },

  // Private routes that need auth.  Will redirect to sign in if not
  {
    path: "/dashboard",
    element: (
      <PrivateRoute>
        <Dashboard />
      </PrivateRoute>
    ),
  },
  {
    path: "/profile",
    element: (
      <PrivateRoute>
        <Profile />
      </PrivateRoute>
    ),
  },
  {
    path: "/stockcharts",
    element: (
      <PrivateRoute>
        <StockCharts />
      </PrivateRoute>
    ),
  },
  {
    path: "/portfolio",
    element: (
      <PrivateRoute>
        <Portfolio />
      </PrivateRoute>
    ),
  },
  {
    path: "/transact",
    element: (
      <PrivateRoute>
        <TransactPage />
      </PrivateRoute>
    ),
  },
]);