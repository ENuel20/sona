"use client";

import { useState, useEffect } from 'react';
import { ArrowLeftRight, Wallet, X, ChevronDown, AlertCircle } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import dynamic from 'next/dynamic';

// Dynamically import WalletMultiButton to avoid SSR issues
const WalletMultiButton = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
);

interface TokenWorkflowProps {
  type: 'swap' | 'stake';
  isOpen: boolean;
  onClose: () => void;
}

interface Token {
  symbol: string;
  name: string;
  balance: number;
  price: number;
  icon?: string;
}

export function TokenWorkflow({ type, isOpen, onClose }: TokenWorkflowProps) {
  const { connected } = useWallet();
  const [step, setStep] = useState<'connect' | 'select' | 'confirm'>('select');
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [targetToken, setTargetToken] = useState<Token | null>(null);
  const [amount, setAmount] = useState('');
  const [duration, setDuration] = useState<string>('30');
  const [showTokenList, setShowTokenList] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Mock tokens data - replace with actual token fetching
  const availableTokens: Token[] = [
    { symbol: 'SOL', name: 'Solana', balance: 10.5, price: 150.25 },
    { symbol: 'USDC', name: 'USD Coin', balance: 1000, price: 1 },
    { symbol: 'RAY', name: 'Raydium', balance: 100, price: 2.5 },
  ];

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Set initial step based on wallet connection
      setStep(connected ? 'select' : 'connect');
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, connected]);

  const handleTokenSelect = (token: Token) => {
    if (!selectedToken) {
      setSelectedToken(token);
    } else {
      setTargetToken(token);
    }
    setShowTokenList(false);
  };

  const handleSubmit = async () => {
    if (!connected) {
      setStep('connect');
      return;
    }

    try {
      setIsLoading(true);
      // Implement actual token swap or staking logic here
      if (type === 'swap') {
        console.log('Swapping tokens:', {
          from: selectedToken,
          to: targetToken,
          amount
        });
      } else {
        console.log('Staking tokens:', {
          token: selectedToken,
          amount,
          duration
        });
      }
      
      onClose();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderConnectStep = () => (
    <div className="p-6 text-center">
      <Wallet className="w-12 h-12 text-blue-400 mx-auto mb-4" />
      <h3 className="text-lg font-semibold mb-2">Connect Your Wallet</h3>
      <p className="text-neutral-400 mb-6">
        Connect your wallet to {type === 'swap' ? 'swap tokens' : 'stake your tokens'} on Solana
      </p>
      <div className="flex justify-center">
        <WalletMultiButton />
      </div>
    </div>
  );

  const renderSelectStep = () => (
    <>
      <div className="space-y-6">
        {/* Token Selection */}
        <div className="space-y-4">
          <div className="relative">
            <button
              onClick={() => setShowTokenList(true)}
              className="w-full px-4 py-3 bg-neutral-800 rounded-lg flex items-center justify-between hover:bg-neutral-700 transition-colors"
            >
              {selectedToken ? (
                <div className="flex items-center gap-2">
                  <span className="font-medium">{selectedToken.symbol}</span>
                  <span className="text-sm text-neutral-400">
                    Balance: {selectedToken.balance}
                  </span>
                </div>
              ) : (
                <span className="text-neutral-400">Select token</span>
              )}
              <ChevronDown className="w-4 h-4 text-neutral-400" />
            </button>

            {showTokenList && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-neutral-800 rounded-lg border border-neutral-700 py-2 shadow-xl z-50">
                {availableTokens.map((token) => (
                  <button
                    key={token.symbol}
                    onClick={() => handleTokenSelect(token)}
                    className="w-full px-4 py-2 hover:bg-neutral-700 flex items-center justify-between"
                  >
                    <span className="font-medium">{token.symbol}</span>
                    <span className="text-sm text-neutral-400">
                      {token.balance} {token.symbol}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {type === 'swap' && selectedToken && (
            <div className="relative">
              <button
                onClick={() => setShowTokenList(true)}
                className="w-full px-4 py-3 bg-neutral-800 rounded-lg flex items-center justify-between hover:bg-neutral-700 transition-colors"
              >
                {targetToken ? (
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{targetToken.symbol}</span>
                    <span className="text-sm text-neutral-400">
                      Balance: {targetToken.balance}
                    </span>
                  </div>
                ) : (
                  <span className="text-neutral-400">Select target token</span>
                )}
                <ChevronDown className="w-4 h-4 text-neutral-400" />
              </button>
            </div>
          )}
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-sm text-neutral-400 mb-2">Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full px-4 py-3 bg-neutral-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {selectedToken && (
            <div className="flex justify-between mt-2 text-sm text-neutral-400">
              <span>Balance: {selectedToken.balance} {selectedToken.symbol}</span>
              <button
                onClick={() => setAmount(selectedToken.balance.toString())}
                className="text-blue-400 hover:text-blue-300"
              >
                MAX
              </button>
            </div>
          )}
        </div>

        {/* Staking Duration */}
        {type === 'stake' && (
          <div>
            <label className="block text-sm text-neutral-400 mb-2">Duration</label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full px-4 py-3 bg-neutral-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="30">30 days (5% APY)</option>
              <option value="60">60 days (7% APY)</option>
              <option value="90">90 days (10% APY)</option>
            </select>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={handleSubmit}
          disabled={!selectedToken || !amount || (type === 'swap' && !targetToken) || isLoading}
          className={`w-full py-3 rounded-lg font-semibold transition-colors ${
            type === 'swap'
              ? 'bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50'
              : 'bg-purple-500 hover:bg-purple-600 disabled:bg-purple-500/50'
          } disabled:cursor-not-allowed`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              Processing...
            </span>
          ) : (
            type === 'swap' ? 'Swap Tokens' : 'Stake Tokens'
          )}
        </button>

        {/* Info Message */}
        <div className="flex items-start gap-2 text-sm text-neutral-400 bg-neutral-800/50 p-3 rounded-lg">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p>
            {type === 'swap'
              ? 'Swapping tokens will require you to approve the transaction in your wallet. Make sure you have enough SOL for gas fees.'
              : 'Staking tokens will lock them for the selected duration. You will earn rewards based on the APY rate.'}
          </p>
        </div>
      </div>
    </>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-neutral-900 rounded-xl border border-neutral-800 w-full max-w-md relative">
        {/* Header */}
        <div className="p-4 border-b border-neutral-800">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <h2 className="text-xl font-bold flex items-center gap-2">
            {type === 'swap' ? (
              <>
                <ArrowLeftRight className="w-6 h-6 text-blue-400" />
                Swap Tokens
              </>
            ) : (
              <>
                <Wallet className="w-6 h-6 text-purple-400" />
                Stake Tokens
              </>
            )}
          </h2>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'connect' ? renderConnectStep() : renderSelectStep()}
        </div>
      </div>
    </div>
  );
} 