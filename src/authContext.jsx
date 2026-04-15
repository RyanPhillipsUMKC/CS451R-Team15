import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [session, setSession] = useState(undefined);

  // user info (demo purpose)
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");

  // recovery state
  const [isRecoverySession, setIsRecoverySession] = useState(false);

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

    supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);

      console.log(event);

      if (event === "PASSWORD_RECOVERY") {
        setIsRecoverySession(true);
      }

      if (event === "SIGNED_OUT") {
        setIsRecoverySession(false);
      }
    });
  }, []);

  const clearRecoverySession = () => {
    setIsRecoverySession(false);
  };

  // Sign out
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error("Error signing out:", error);

    setUserEmail("");
    setUserPassword("");
  };

  // Reset password
  const resetPassword = async (email) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: "http://localhost:5173/updatepassword",
      });

      if (error) {
        console.error("Reset password error:", error.message);
        return { success: false, error };
      }

      return { success: true, data };
    } catch (error) {
      console.error("Unexpected reset password error:", error);
      return { success: false, error };
    }
  };

  // Update password
  const updatePassword = async (newPassword, otp) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
        nonce: otp,
      });

      if (error) {
        console.error("Update password error:", error.message);
        return { success: false, error };
      }

      return { success: true, data };
    } catch (error) {
      console.error("Unexpected update password error:", error);
      return { success: false, error };
    }
  };

  // Verify OTP (recovery)
  const verifyRecoveryOtp = async (email, token) => {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: "recovery",
      });

      if (error) {
        console.error("Verify recovery OTP error:", error.message);
        return { success: false, error };
      }

      return { success: true, data };
    } catch (error) {
      console.error("Unexpected verify recovery OTP error:", error);
      return { success: false, error };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        signUpNewUser,
        signInUser,
        signOut,

        resetPassword,
        updatePassword,
        verifyRecoveryOtp,

        isRecoverySession,
        clearRecoverySession,

        userEmail,
        userPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const UserAuth = () => useContext(AuthContext);