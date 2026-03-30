
import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import LoginPage from "./Login/Login";
import RegisterPage from "./Login/Register";
import Dashboard from "./Dashboard/Dashboard";
import Profile from "./Profile/Profile";
import PrivateRoute from "./PrivateRoute/PrivateRoute";
import StockCharts from "./StockCharts/StockCharts";

export const router = createBrowserRouter([
  { path: "/", element: <App /> },
  { path: "/signin", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },

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
]);