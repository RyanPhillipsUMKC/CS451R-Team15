import { UserAuth } from "../authContext";
import { Navigate } from "react-router-dom";


// wrap other components that require the user to be signed in
// if not signed in -> send to landing page
const PrivateRoute = ({ children }) => {
  const { session } = UserAuth();

  if (session === undefined) {
    return <div>Loading...</div>;
  }

  return <div>{session ? <>{children}</> : <Navigate to="/" />}</div>;
};

export default PrivateRoute;