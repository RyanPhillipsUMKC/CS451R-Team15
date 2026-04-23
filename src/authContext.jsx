import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [session, setSession] = useState(undefined);

  // recovery state
  const [isRecoverySession, setIsRecoverySession] = useState(false);

  // Sign up
  const signUpNewUser = async (email, password, firstName, lastName) => {
    const { data, error } = await supabase.auth.signUp({
      email: email.toLowerCase(),
      password: password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      },
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

  // Profile

  const getUserProfile = async () => {
    try {
      const userId = session?.user?.id;

      if (!userId) {
        return { success: false, error: "No authenticated user found." };
      }

      const { data, error } = await supabase
        .from("Profiles")
        .select(`*`)
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching user profile:", error.message);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error("Unexpected fetch profile error:", error);
      return {
        success: false,
        error: error?.message || "Unexpected error fetching profile.",
      };
    }
  };

  // Transaction queries

  const getUserTransactions = async () => {
    try {
      const userId = session?.user?.id;

      if (!userId) {
        return { success: false, error: "No authenticated user found." };
      }

      const { data, error } = await supabase
        .from("Transactions")
        .select(`
          id,
          type,
          quantity,
          price,
          created_at,
          stock_id,
          Stocks (
            ticker,
            company_name
          )
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching transactions:", error.message);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error("Unexpected fetch transactions error:", error);
      return {
        success: false,
        error: error?.message || "Unexpected error fetching transactions.",
      };
    }
  };

  const getUserHoldings = async () => {
    const { success, data, error } = await getUserTransactions();

    if (!success) {
      return { success: false, error };
    }

    const holdingsMap = {};

    // Oldest first makes the math easier to reason about
    const orderedTransactions = [...data].sort(
      (a, b) => new Date(a.created_at) - new Date(b.created_at)
    );

    orderedTransactions.forEach((tx) => {
      const ticker = tx.Stocks?.ticker;
      const companyName = tx.Stocks?.company_name;

      if (!ticker) return;

      if (!holdingsMap[ticker]) {
        holdingsMap[ticker] = {
          ticker,
          company_name: companyName,
          shares: 0,
          totalCost: 0,
          averageCost: 0,
        };
      }

      const holding = holdingsMap[ticker];
      const quantity = Number(tx.quantity) || 0;
      const price = Number(tx.price) || 0;

      if (tx.type === "buy") {
        holding.shares += quantity;
        holding.totalCost += quantity * price;
      } else if (tx.type === "sell") {
        // remove shares using average-cost basis
        const currentAverageCost =
          holding.shares > 0 ? holding.totalCost / holding.shares : 0;

        holding.shares -= quantity;
        holding.totalCost -= quantity * currentAverageCost;

        // clamp in case of floating point issues
        if (holding.shares < 0) holding.shares = 0;
        if (holding.totalCost < 0) holding.totalCost = 0;
      }

      holding.averageCost =
        holding.shares > 0 ? holding.totalCost / holding.shares : 0;
    });

    // remove fully sold positions??
    Object.keys(holdingsMap).forEach((ticker) => {
      if (holdingsMap[ticker].shares <= 0) {
        delete holdingsMap[ticker];
      }
    });

    return { success: true, data: holdingsMap };
  };
  
  // add to account blance directly
  const addToCurrentUserStartingFunds = async (amountToAdd) => {
    try {
      const userId = session?.user?.id;

      if (!userId) {
        return { success: false, error: "No authenticated user found." };
      }

      const numericAmount = Number(amountToAdd);

      if (Number.isNaN(numericAmount)) {
        return { success: false, error: "Please enter a valid amount." };
      }

      // Get current starting funds first
      const { data: profile, error: profileError } = await supabase
        .from("Profiles")
        .select("starting_funds")
        .eq("id", userId)
        .single();

      if (profileError) {
        console.error("Error fetching starting funds:", profileError.message);
        return { success: false, error: profileError.message };
      }

      const currentStartingFunds = Number(profile?.starting_funds ?? 0);
      const newStartingFunds = currentStartingFunds + numericAmount;

      const { data, error } = await supabase
        .from("Profiles")
        .update({
          starting_funds: newStartingFunds,
        })
        .eq("id", userId)
        .select()
        .single();

      if (error) {
        console.error("Error updating starting funds:", error.message);
        return { success: false, error: error.message };
      }

      return {
        success: true,
        data,
        previousStartingFunds: currentStartingFunds,
        amountAdded: numericAmount,
        newStartingFunds,
      };
    } catch (error) {
      console.error("Unexpected add starting funds error:", error);
      return {
        success: false,
        error: error?.message || "Unexpected error updating starting funds.",
      };
    }
  };


  const createMockTransaction = async ({ ticker, type, quantity, price }) => {
    try {
      const userId = session?.user?.id;

      if (!userId) {
        return { success: false, error: "No authenticated user found." };
      }

      if (!ticker || !type || !quantity || !price) {
        return { success: false, error: "Missing transaction fields." };
      }

      const { data: stockRow, error: stockError } = await supabase
        .from("Stocks")
        .select("id, ticker")
        .eq("ticker", ticker)
        .single();

      if (stockError || !stockRow) {
        return { success: false, error: `Stock with ticker ${ticker} was not found.` };
      }

      const { data, error } = await supabase
        .from("Transactions")
        .insert({
          user_id: userId,
          stock_id: stockRow.id,
          type,
          quantity,
          price,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating transaction:", error.message);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error("Unexpected create transaction error:", error);
      return {
        success: false,
        error: error?.message || "Unexpected error creating transaction.",
      };
    }
  };

  const getUserFinancialSummary = async () => {
    try {
      const [profileResult, transactionsResult, holdingsResult] = await Promise.all([
        getUserProfile(),
        getUserTransactions(),
        getUserHoldings(),
      ]);

      if (!profileResult.success) {
        return { success: false, error: profileResult.error };
      }

      if (!transactionsResult.success) {
        return { success: false, error: transactionsResult.error };
      }

      if (!holdingsResult.success) {
        return { success: false, error: holdingsResult.error };
      }

      const startingFunds = Number(profileResult.data?.starting_funds ?? 0);
      const transactions = transactionsResult.data ?? [];
      const holdings = holdingsResult.data ?? {};

      let totalBuyCost = 0;
      let totalSellProceeds = 0;

      transactions.forEach((tx) => {
        const quantity = Number(tx.quantity) || 0;
        const price = Number(tx.price) || 0;
        const total = quantity * price;

        if (tx.type === "buy") {
          totalBuyCost += total;
        } else if (tx.type === "sell") {
          totalSellProceeds += total;
        }
      });

      const cashBalance = startingFunds - totalBuyCost + totalSellProceeds;

      return {
        success: true,
        data: {
          startingFunds,
          cashBalance,
          totalBuyCost,
          totalSellProceeds,
          holdings,
          transactions,
        },
      };
    } catch (error) {
      console.error("Unexpected financial summary error:", error);
      return {
        success: false,
        error: error?.message || "Unexpected error deriving financial summary.",
      };
    }
  };

  const getLiveMarketData = async () => {
    try {
      // from project public folder
      const response = await fetch("/NASDAQ_20260422.csv");

      if (!response.ok) {
        throw new Error("Failed to load market data CSV");
      }

      const text = await response.text();

      const rows = text.split("\n").filter((row) => row.trim() !== "");

      // Assume first row is header
      const headers = rows[0].split(",");

      const data = rows.slice(1).map((row) => {
        const values = row.split(",");

        const entry = {};
        headers.forEach((header, index) => {
          entry[header.trim()] = values[index]?.trim();
        });

        return entry;
      });

      // Convert into lookup map by ticker
      const marketMap = {};

      data.forEach((stock) => {
        const ticker = stock.Symbol || stock.symbol || stock.Ticker;

        if (!ticker) return;

        marketMap[ticker] = {
          ticker,
          companyName: stock.Name || stock.company_name,
          currentPrice: Number(stock.LastSale || stock.price || 0),
        };
      });

      return { success: true, data: marketMap };
    } catch (error) {
      console.error("Error loading mock market data:", error);
      return { success: false, error: error.message };
    }
  };

  const syncStocksFromCsv = async (marketData) => {
    try {
      const rows = Object.values(marketData).map((stock) => ({
        ticker: stock.ticker.toUpperCase(),
        company_name: stock.companyName,
      }));

      const { data, error } = await supabase
        .from("Stocks")
        .upsert(rows, {
          onConflict: "ticker",
          ignoreDuplicates: true,
        });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const user = session?.user ?? null;

  return (
    <AuthContext.Provider
      value={{
        signUpNewUser,
        signInUser,
        signOut,
        resetPassword,
        updatePassword,
        verifyRecoveryOtp,
        isRecoverySession,
        clearRecoverySession,
        getUserProfile,
        getUserTransactions,
        getUserHoldings,
        addToCurrentUserStartingFunds,
        createMockTransaction,
        getUserFinancialSummary,
        getLiveMarketData,
        syncStocksFromCsv,
        session,
        user
      }} >
      {children}
    </AuthContext.Provider>
  );
};

export const UserAuth = () => useContext(AuthContext);