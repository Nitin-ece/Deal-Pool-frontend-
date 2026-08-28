import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../redux/store";
import { fetchContracts } from "../redux/slices/contractsSlice";
import { fetchAllDeals } from "../redux/slices/dealsSlice";
import { useAuth } from "../hooks/useAuth";
import { StatusBadge } from "../components/common/StatusBadge";
import {
  FileText,
  Handshake,
  Compass,
  ArrowRight,
  Sparkles,
  Calendar,
  Lock,
  RefreshCw,
  Coins,
  ShieldCheck,
} from "lucide-react";

export function Contracts() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const { contracts, loading: contractsLoading } = useAppSelector((state) => state.contracts);
  const { allDeals } = useAppSelector((state) => state.deals);

  const [activeTab, setActiveTab] = useState<"borrowing" | "lending">("borrowing");

  useEffect(() => {
    if (user) {
      dispatch(fetchContracts());
      dispatch(fetchAllDeals({}));
    }
  }, [dispatch, user]);

  const handleRefresh = () => {
    dispatch(fetchContracts());
    dispatch(fetchAllDeals({}));
  };

  const getDealTitle = (dealId: string) => {
    const deal = allDeals.find((d) => d.id === dealId);
    return deal ? deal.title : "Hyperlocal Resource Exchange";
  };

  const getDealCategory = (dealId: string) => {
    const deal = allDeals.find((d) => d.id === dealId);
    return deal ? deal.category : "Equipment";
  };

  // Filter contracts based on tab
  const borrowingContracts = contracts.filter((c) => c.requester_id === user?.id);
  const lendingContracts = contracts.filter((c) => c.provider_id === user?.id);

  const activeContractsList = activeTab === "borrowing" ? borrowingContracts : lendingContracts;

  return (
    <div className="max-w-6xl mx-auto px-4 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold border border-emerald-500/30 mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Escrow Agreements & Custody Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--ink)] tracking-tight font-display">
            My Escrow Contracts
          </h1>
          <p className="text-xs text-[var(--muted)] mt-0.5 font-normal">
            Verify neighborhood exchanges, track secure custody handoffs, and manage smart escrow releases.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          className="px-4 py-2 rounded-full bg-[var(--surface)] border border-[var(--line)] hover:bg-[var(--line)]/30 text-xs font-bold text-[var(--ink)] shadow-2xs flex items-center gap-1.5 cursor-pointer transition active:scale-95"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Tabs Selector */}
      <div className="flex border-b border-[var(--line)] gap-6">
        <button
          onClick={() => setActiveTab("borrowing")}
          className={`pb-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "borrowing"
              ? "border-[var(--ink)] text-[var(--ink)]"
              : "border-transparent text-[var(--muted)] hover:text-[var(--ink)]"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Borrowing ({borrowingContracts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("lending")}
          className={`pb-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "lending"
              ? "border-[var(--ink)] text-[var(--ink)]"
              : "border-transparent text-[var(--muted)] hover:text-[var(--ink)]"
          }`}
        >
          <Handshake className="w-4 h-4" />
          <span>Lending ({lendingContracts.length})</span>
        </button>
      </div>

      {/* List content */}
      <div className="space-y-4">
        {contractsLoading ? (
          <div className="text-center py-12 text-xs text-[var(--muted)] font-semibold">
            Loading escrow contracts...
          </div>
        ) : activeContractsList.length === 0 ? (
          <div className="text-center py-16 bg-[var(--surface)] rounded-3xl border border-[var(--line)] p-8 space-y-3 shadow-2xs">
            <div className="w-12 h-12 rounded-2xl bg-[var(--paper)] text-[var(--muted)] flex items-center justify-center mx-auto">
              <Handshake className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-[var(--ink)] text-base font-display">No contracts active</h3>
            <p className="text-xs text-[var(--muted)] max-w-sm mx-auto font-normal">
              {activeTab === "borrowing"
                ? "You haven't accepted any proposals to borrow resources. Explore the neighborhood radar!"
                : "Neighbors haven't accepted any of your outgoing proposals yet."}
            </p>
            <div className="pt-2">
              <Link
                to="/deals"
                className="px-5 py-2.5 rounded-full bg-[var(--ink)] hover:opacity-90 text-[var(--paper)] text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs transition"
              >
                <Compass className="w-4 h-4" />
                <span>Explore Radar</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {activeContractsList.map((contract) => {
              const rentalFee = Number(contract.rental_fee || contract.lend_fee || 0);
              const securityDeposit = Number(contract.security_deposit || contract.security_amount || 0);
              const totalHeld = rentalFee + securityDeposit;

              return (
                <div
                  key={contract.id}
                  onClick={() => navigate(`/contracts/${contract.id}`)}
                  className="bg-[var(--surface)] rounded-3xl p-6 border border-[var(--line)] hover:border-[var(--ink)]/40 shadow-2xs transition-all flex flex-col justify-between cursor-pointer group"
                >
                  <div className="space-y-3">
                    {/* Top: Status & Date */}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-[var(--muted)] font-mono flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(contract.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                      <StatusBadge status={contract.status} />
                    </div>

                    {/* Middle: Title & Category */}
                    <div>
                      <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                        {getDealCategory(contract.deal_id)}
                      </span>
                      <h3 className="font-bold text-[var(--ink)] text-base group-hover:opacity-85 mt-2 line-clamp-1">
                        {getDealTitle(contract.deal_id)}
                      </h3>
                      <p className="text-[11px] text-[var(--muted)] mt-1">
                        Contract ID: <span className="font-mono">{contract.id.slice(0, 8)}...</span>
                      </p>
                    </div>
                  </div>

                  {/* Bottom: Fee breakdown & Action link */}
                  <div className="pt-4 mt-4 border-t border-[var(--line)] flex items-end justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                        <Lock className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-[9px] text-[var(--muted)] font-bold uppercase tracking-wider">
                          Escrowed Funds
                        </div>
                        <div className="text-sm font-extrabold text-[var(--ink)] flex items-center gap-1">
                          <span>₹{totalHeld.toLocaleString("en-IN")}</span>
                          <span className="text-[10px] text-[var(--muted)] font-normal">
                            (fee ₹{rentalFee} + dep ₹{securityDeposit})
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-xs font-bold text-[var(--ink)] group-hover:translate-x-0.5 transition-transform">
                      <span>Manage Flow</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Contracts;
