import React, { useState, useEffect } from "react";
import {
  Coins,
  Lock,
  Plus,
  X,
  ArrowUpRight,
  ArrowDownLeft,
  Shield,
  AlertCircle,
  CheckCircle2,
  History,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { fetchWallet, fetchLedger, depositCoins } from "../../redux/slices/walletSlice";
import type { WalletSummary } from "../../types/contracts";

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWalletUpdated?: (wallet: WalletSummary) => void;
  initialDepositAmount?: number;
}

export function WalletModal({
  isOpen,
  onClose,
  onWalletUpdated,
  initialDepositAmount,
}: WalletModalProps) {
  const dispatch = useAppDispatch();
  const { summary: wallet, ledger, loading, depositLoading } = useAppSelector(
    (state) => state.wallet
  );

  const [depositAmount, setDepositAmount] = useState<number | "">(initialDepositAmount || 500);
  const [depositSuccess, setDepositSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState<boolean>(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      if (initialDepositAmount) {
        setDepositAmount(initialDepositAmount);
      }
      setDepositSuccess(null);
      setError(null);
      dispatch(fetchWallet());
      dispatch(fetchLedger());
    }
  }, [isOpen, initialDepositAmount, dispatch]);

  useEffect(() => {
    if (wallet && onWalletUpdated) {
      onWalletUpdated(wallet);
    }
  }, [wallet, onWalletUpdated]);

  if (!isOpen) return null;

  const balanceNum = Number(wallet?.balance ?? 0);
  const lockedNum = Number(wallet?.locked_balance ?? 0);

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(depositAmount);
    if (!amount || amount <= 0) {
      setError("Please enter a valid deposit amount");
      return;
    }

    setError(null);
    setDepositSuccess(null);
    try {
      const resultAction = await dispatch(depositCoins(amount));
      if (depositCoins.fulfilled.match(resultAction)) {
        setDepositSuccess(`Successfully added ₹${amount.toLocaleString("en-IN")} to your wallet!`);
        if (onWalletUpdated) onWalletUpdated(resultAction.payload);
      } else {
        setError((resultAction.payload as string) || "Deposit failed");
      }
    } catch (err: any) {
      setError(err?.message || "Deposit failed");
    }
  };

  return (
    <div
      id="wallet-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-150 overflow-y-auto"
    >
      <div className="relative w-full max-w-md my-8 overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] shadow-2xl transition-all">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--line)] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-xs">
              <Coins className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-base font-bold text-[var(--ink)]">
                DealPool Wallet
              </h2>
              <p className="text-[11px] text-[var(--muted)]">
                Escrow & Platform Coin Balance
              </p>
            </div>
          </div>
          <button
            type="button"
            id="close-wallet-modal-btn"
            onClick={onClose}
            aria-label="Close modal"
            className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--muted)] hover:bg-[var(--line)]/50 hover:text-[var(--ink)] transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5">
          {/* Success Alert */}
          {depositSuccess && (
            <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-400 font-medium animate-in fade-in duration-200">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              <span>{depositSuccess}</span>
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <div className="flex items-center gap-2.5 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-400 font-medium animate-in fade-in duration-200">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Balance Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/5 p-4 transition">
              <div className="flex items-center justify-between text-xs text-emerald-500 font-bold mb-1">
                <span>Available</span>
                <Coins className="h-4 w-4" />
              </div>
              <div className="font-display text-2xl font-extrabold text-[var(--ink)]">
                ₹{balanceNum.toLocaleString("en-IN")}
              </div>
              <p className="mt-1 text-[10px] text-[var(--muted)]">Ready for deals & offers</p>
            </div>

            <div className="rounded-2xl border border-amber-500/25 bg-amber-500/5 p-4 transition">
              <div className="flex items-center justify-between text-xs text-amber-500 font-bold mb-1">
                <span>In Escrow</span>
                <Lock className="h-4 w-4" />
              </div>
              <div className="font-display text-2xl font-extrabold text-[var(--ink)]">
                ₹{lockedNum.toLocaleString("en-IN")}
              </div>
              <p className="mt-1 text-[10px] text-[var(--muted)]">Held in active contracts</p>
            </div>
          </div>

          {/* Top-Up Section */}
          <form onSubmit={handleDeposit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-[var(--ink)] mb-2">
                Top Up Coins
              </label>
              <div className="grid grid-cols-4 gap-2 mb-2.5">
                {[100, 500, 1000, 2500].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setDepositAmount(amt)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      depositAmount === amt
                        ? "bg-[var(--ink)] text-[var(--paper)] border-[var(--ink)] shadow-xs scale-102"
                        : "bg-[var(--surface)] text-[var(--ink)] border-[var(--line)] hover:bg-[var(--line)]/40"
                    }`}
                  >
                    + ₹{amt}
                  </button>
                ))}
              </div>

              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[var(--muted)]">
                  ₹
                </span>
                <input
                  type="number"
                  min="1"
                  value={depositAmount}
                  onChange={(e) =>
                    setDepositAmount(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  placeholder="Custom amount"
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-sm font-semibold text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--ink)]/30 transition-all placeholder:text-[var(--muted)]"
                />
              </div>
            </div>

            <button
              type="submit"
              id="confirm-deposit-btn"
              disabled={depositLoading || !depositAmount}
              className="w-full rounded-2xl bg-[var(--ink)] py-3 text-xs font-bold text-[var(--paper)] hover:opacity-90 active:scale-98 disabled:opacity-50 transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2"
            >
              <Plus className="h-4 w-4" />
              <span>
                {depositLoading
                  ? "Processing Top Up..."
                  : `Add ₹${depositAmount || 0} to Wallet`}
              </span>
            </button>
          </form>

          {/* Ledger History Collapsible Section */}
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--paper)]/50 overflow-hidden">
            <button
              type="button"
              onClick={() => setShowHistory((v) => !v)}
              className="w-full px-4 py-3 text-xs font-bold text-[var(--ink)] flex items-center justify-between hover:bg-[var(--line)]/30 transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <History className="h-3.5 w-3.5 text-[var(--muted)]" />
                <span>Recent Transactions</span>
                <span className="text-[10px] text-[var(--muted)] font-normal">
                  ({ledger.length})
                </span>
              </div>
              {showHistory ? (
                <ChevronUp className="h-4 w-4 text-[var(--muted)]" />
              ) : (
                <ChevronDown className="h-4 w-4 text-[var(--muted)]" />
              )}
            </button>

            {showHistory && (
              <div className="border-t border-[var(--line)] p-3 max-h-48 overflow-y-auto space-y-2">
                {ledger.length === 0 ? (
                  <p className="text-center py-4 text-xs text-[var(--muted)]">
                    No transactions yet.
                  </p>
                ) : (
                  ledger.map((entry) => {
                    const amount = Number(entry.amount);
                    const isCredit = [
                      "deposit",
                      "escrow_release_security",
                      "escrow_payout_fee",
                    ].includes(entry.entry_type);

                    return (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between p-2 rounded-xl bg-[var(--surface)] border border-[var(--line)] text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg ${
                              isCredit
                                ? "bg-emerald-500/20 text-emerald-400"
                                : "bg-amber-500/20 text-amber-400"
                            }`}
                          >
                            {isCredit ? (
                              <ArrowDownLeft className="h-3.5 w-3.5" />
                            ) : (
                              <ArrowUpRight className="h-3.5 w-3.5" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-[var(--ink)] line-clamp-1">
                              {entry.description || entry.entry_type}
                            </p>
                            <p className="text-[10px] text-[var(--muted)]">
                              {new Date(entry.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`font-mono font-bold ${
                            isCredit ? "text-emerald-400" : "text-[var(--ink)]"
                          }`}
                        >
                          {isCredit ? "+" : "-"}₹{amount.toFixed(2)}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Footer Security Note & Exit Button */}
          <div className="pt-2 border-t border-[var(--line)] flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[10px] text-[var(--muted)]">
              <Shield className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span>Multi-sig escrow secured</span>
            </div>
            <button
              type="button"
              id="close-wallet-overview-btn"
              onClick={onClose}
              className="rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 py-1.5 text-xs font-bold text-[var(--ink)] hover:bg-[var(--line)]/50 transition cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WalletModal;
