"use client";

import { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { PublicKey } from '@solana/web3.js';

interface TokenBalance {
  mint: string;
  symbol: string;
  balance: number;
  decimals: number;
}

export const useTokenBalances = () => {
  const { connection } = useConnection();
  const { connected, publicKey } = useWallet();
  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchBalances = async () => {
    if (!connected || !publicKey) return;

    setIsLoading(true);
    try {
      // Fetch SOL balance
      const solBalance = await connection.getBalance(publicKey);
      
      // Fetch all token accounts
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        publicKey,
        { programId: TOKEN_PROGRAM_ID }
      );

      // Create balances array starting with SOL
      const allBalances: TokenBalance[] = [{
        mint: 'SOL',
        symbol: 'SOL',
        balance: solBalance / 1e9,
        decimals: 9
      }];

      // Add other token balances
      tokenAccounts.value.forEach((account) => {
        const parsedInfo = account.account.data.parsed.info;
        const balance = Number(parsedInfo.tokenAmount.amount) / Math.pow(10, parsedInfo.tokenAmount.decimals);
        
        if (balance > 0) {
          allBalances.push({
            mint: parsedInfo.mint,
            symbol: parsedInfo.mint, // You can add a mapping for known tokens
            balance,
            decimals: parsedInfo.tokenAmount.decimals
          });
        }
      });

      setBalances(allBalances);
      console.log('Wallet Balances:', allBalances);
    } catch (error) {
      console.error('Error fetching token balances:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (connected && publicKey) {
      fetchBalances();
    }
  }, [connected, publicKey]);

  return {
    balances,
    isLoading,
    refetch: fetchBalances
  };
}; 