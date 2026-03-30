import { UserAuth } from "../authContext";
import { Navigate } from "react-router-dom";

let IS_DEVELOPMENT = false;

// wrap other components that require the user to be signed in
// if not signed in -> send to landing page
const PrivateRoute = ({ children }) => {

  if (IS_DEVELOPMENT) // Ryan - remove when eveyone knows how to use supabase and has env set up locally
  {
    return children;
  }

  const { session } = UserAuth();

  if (session === undefined) {
    return <div>Loading...</div>;
  }

  return <div>{session ? <>{children}</> : <Navigate to="/" />}</div>;
};

export default PrivateRoute;