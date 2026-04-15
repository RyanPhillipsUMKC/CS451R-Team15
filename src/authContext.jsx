import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [session, setSession] = useState(undefined);
  const [userEmail, setUserEmail] = useState(""); // ✅ store email
  const [userPassword, setUserPassword] = useState(""); // ✅ store password (only for demo)

  // Sign up
  const signUpNewUser = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email: email.toLowerCase(),
      password,
    });

    if (error) {
      console.error("Error signing up: ", error);
      return { success: false, error };
    }

    return { success: true, data };
  };

  // Sign in
  const signInUser = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase(),
        password,
      });

      if (error) {
        console.error("Sign-in error:", error.message);
        return { success: false, error: error.message };
      }

      // ✅ store email & password for demo purposes
      setUserEmail(email);
      setUserPassword(password);

      return { success: true, data };
    } catch (error) {
      console.error("Unexpected error during sign-in:", error.message);
      return {
        success: false,
        error: "An unexpected error occurred. Please try again.",
      };
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) console.error("Error signing out:", error);

    // ✅ clear email/password
    setUserEmail("");
    setUserPassword("");
  }

  return (
    <AuthContext.Provider
      value={{
        signUpNewUser,
        signInUser,
        session,
        signOut,
        userEmail,
        userPassword, // ✅ expose password for demo
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const UserAuth = () => useContext(AuthContext);