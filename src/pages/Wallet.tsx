import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Coins,
  Lock,
  Plus,
  ArrowLeft,
  ArrowUpRight,
  ArrowDownLeft,
  Shield,
  AlertCircle,
  CheckCircle2,
  History,
  ExternalLink,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../redux/store";
import { fetchWallet, fetchLedger, depositCoins } from "../redux/slices/walletSlice";
import { BrandMark } from "../components/common/BrandMark";

export function Wallet() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { summary: wallet, ledger, loading, depositLoading } = useAppSelector(
    (state) => state.wallet
  );

  const [depositAmount, setDepositAmount] = useState<number | "">(500);
  const [depositSuccess, setDepositSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchWallet());
    dispatch(fetchLedger());
  }, [dispatch]);

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
        setDepositSuccess(
          `Successfully credited ₹${amount.toLocaleString("en-IN")} to your wallet!`
        );
        dispatch(fetchWallet());
        dispatch(fetchLedger());
      } else {
        setError((resultAction.payload as string) || "Deposit failed");
      }
    } catch (err: any) {
      setError(err?.message || "Deposit failed");
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-[var(--paper)] text-[var(--ink)] antialiased flex flex-col justify-center items-center px-4 py-8 sm:py-12">
      <div className="relative z-10 w-full max-w-lg">
        {/* Header Branding */}
        <div className="mb-6 text-center flex flex-col items-center">
          <BrandMark size="md" to="/deals" />
          <h1 className="mt-4 font-display text-2xl sm:text-3xl font-bold tracking-tight text-[var(--ink)]">
            DealPool Wallet
          </h1>
          <p className="mt-1.5 text-xs text-[var(--muted)] max-w-sm">
            Top up your balance, view active escrow holdings, and review your immutable transaction ledger.
          </p>
        </div>

        {/* Main Wallet Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-6 sm:p-8 shadow-sm space-y-6"
        >
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
          <div className="grid grid-cols-2 gap-3.5">
            <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/5 p-4 transition">
              <div className="flex items-center justify-between text-xs text-emerald-500 font-bold mb-1">
                <span>Available</span>
                <Coins className="h-4 w-4" />
              </div>
              <div className="font-display text-2xl sm:text-3xl font-extrabold text-[var(--ink)]">
                ₹{balanceNum.toLocaleString("en-IN")}
              </div>
              <p className="mt-1 text-[10px] text-[var(--muted)]">Ready for deals & offers</p>
            </div>

            <div className="rounded-2xl border border-amber-500/25 bg-amber-500/5 p-4 transition">
              <div className="flex items-center justify-between text-xs text-amber-500 font-bold mb-1">
                <span>In Escrow</span>
                <Lock className="h-4 w-4" />
              </div>
              <div className="font-display text-2xl sm:text-3xl font-extrabold text-[var(--ink)]">
                ₹{lockedNum.toLocaleString("en-IN")}
              </div>
              <p className="mt-1 text-[10px] text-[var(--muted)]">Held in active contracts</p>
            </div>
          </div>

          {/* Top Up Form */}
          <form onSubmit={handleDeposit} className="space-y-3.5 pt-1 border-t border-[var(--line)]">
            <div className="pt-2">
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
                  placeholder="Enter custom amount"
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--paper)] text-sm font-semibold text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--ink)]/30 transition-all placeholder:text-[var(--muted)]"
                />
              </div>
            </div>

            <button
              type="submit"
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

          {/* Recent Transactions List */}
          <div className="space-y-2 pt-2 border-t border-[var(--line)]">
            <div className="flex items-center justify-between text-xs font-bold text-[var(--ink)]">
              <div className="flex items-center gap-1.5">
                <History className="h-3.5 w-3.5 text-[var(--muted)]" />
                <span>Recent Transactions</span>
              </div>
              <span className="text-[10px] text-[var(--muted)] font-normal">
                {ledger.length} records
              </span>
            </div>

            <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
              {ledger.length === 0 ? (
                <p className="text-center py-4 text-xs text-[var(--muted)]">
                  No transaction history recorded yet.
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
                      className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--paper)] border border-[var(--line)] text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
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
                            {new Date(entry.created_at).toLocaleString()}
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
          </div>

          {/* Exit / Return Button */}
          <div className="pt-3 border-t border-[var(--line)] flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[11px] text-[var(--muted)]">
              <Shield className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span>Multi-sig escrow secured</span>
            </div>
            <button
              type="button"
              onClick={() => navigate("/deals")}
              className="inline-flex items-center gap-1.5 rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 py-2 text-xs font-bold text-[var(--ink)] hover:bg-[var(--line)]/50 transition active:scale-95 cursor-pointer shadow-2xs"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Radar</span>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Wallet;
