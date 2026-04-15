import { Navigate } from "react-router-dom";
import { UserAuth } from "../authContext";

export default function RecoveryRoute({ children }) {
  const { isRecoverySession } = UserAuth();

  if (!isRecoverySession) {
    return <Navigate to="/forgotpassword" replace />;
  }

  return children;
}