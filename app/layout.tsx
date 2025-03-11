"use client";

import { ReactNode } from "react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";
import "./globals.css";
import "./wallet.css";
import WalletContextProvider from "@/contexts/WalletContextProvider";
import { ChatProvider } from "@/contexts/ChatContext";
import { metadata } from "./metadata";

// Import Wallet Adapter UI styles
import "@solana/wallet-adapter-react-ui/styles.css";

// Define the network (use devnet for testing, mainnet-beta for production)
const network = WalletAdapterNetwork.Devnet;
const endpoint = clusterApiUrl(network);

// List of wallets to support (Phantom in this case)
const wallets = [new PhantomWalletAdapter()];

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
      </head>
      <body>
        <WalletContextProvider>
          <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect={false}>
              <WalletModalProvider>
                <ChatProvider>
                  {children}
                </ChatProvider>
              </WalletModalProvider>
            </WalletProvider>
          </ConnectionProvider>
        </WalletContextProvider>
      </body>
    </html>
  );
}