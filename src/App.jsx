import LandingPage from "./Landing/Landing.jsx";
import { UserAuth } from "./authContext";

export default function App() {
  const { user } = UserAuth();
  return (
    <>
      <LandingPage />
    </>
  );
}
