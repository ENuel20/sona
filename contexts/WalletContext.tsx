"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface WalletContextType {
  walletConnected: boolean;
  walletAddress: string;
  setWalletAddress: (address: string) => void;
}

const WalletContext = createContext<WalletContextType>({
  walletConnected: false,
  walletAddress: "",
  setWalletAddress: () => {},
});

export function WalletProvider({ children }: { children: ReactNode }) {
  const [walletAddress, setWalletAddress] = useState("");

  const value = {
    walletConnected: !!walletAddress,
    walletAddress,
    setWalletAddress,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
} 