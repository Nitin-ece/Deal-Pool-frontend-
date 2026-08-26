import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Handshake,
  Coins,
  Shield,
  Phone,
  MessageSquare,
  Instagram,
  Send,
  X,
  AlertCircle,
  CheckCircle2,
  Lock,
  ArrowRight,
  Info,
} from "lucide-react";
import { Offer, Deal } from "../../types";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { acceptOffer } from "../../redux/slices/offersSlice";
import { fetchWallet } from "../../redux/slices/walletSlice";

interface AcceptOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  offer: Offer;
  deal: Deal;
  onAccepted?: () => void;
}

export function AcceptOfferModal({
  isOpen,
  onClose,
  offer,
  deal,
  onAccepted,
}: AcceptOfferModalProps) {
  const dispatch = useAppDispatch();
  const wallet = useAppSelector((state) => state.wallet.summary);

  const [contactPlatform, setContactPlatform] = useState<"whatsapp" | "call" | "instagram" | "telegram">("whatsapp");
  const [contactHandle, setContactHandle] = useState("");
  const [contactNotes, setContactNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const offerPrice = Number(offer.price || 0);
  const budgetMin = Number(deal.budget_min || offerPrice);
  const budgetMax = Number(deal.budget_max || offerPrice);
  const availableBalance = Number(wallet?.balance || 0);
  const minRequiredToPay = offerPrice;
  const maxPossibleWithSecurity = Math.max(offerPrice, budgetMax);
  const isBalanceSufficient = availableBalance >= minRequiredToPay;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactHandle.trim()) {
      setError("Please provide your contact handle or phone number.");
      return;
    }
    if (!contactNotes.trim()) {
      setError("Please specify your meeting place or contact timing instructions.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Save contact exchange privately for this deal/contract
      const contactPayload = {
        platform: contactPlatform,
        handle: contactHandle.trim(),
        notes: contactNotes.trim(),
        agreedPrice: offerPrice,
        dealId: deal.id,
        offerId: offer.id,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(`dealpool_contact_deal_${deal.id}`, JSON.stringify(contactPayload));
      localStorage.setItem(`dealpool_contact_offer_${offer.id}`, JSON.stringify(contactPayload));

      await dispatch(acceptOffer(offer.id)).unwrap();
      dispatch(fetchWallet());
      if (onAccepted) onAccepted();
      onClose();
    } catch (err: any) {
      setError(typeof err === "string" ? err : err?.message || "Failed to accept offer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="accept-offer-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-150 overflow-y-auto"
    >
      <div className="relative w-full max-w-lg my-8 overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] shadow-2xl transition-all">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--line)] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-xs">
              <Handshake className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-base font-bold text-[var(--ink)]">
                Accept Proposal & Connect
              </h2>
              <p className="text-[11px] text-[var(--muted)]">
                Lock escrow & provide private handoff contact
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Close modal"
            className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--muted)] hover:bg-[var(--line)]/50 hover:text-[var(--ink)] transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Error Alert */}
          {error && (
            <div className="flex items-center gap-2.5 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-400 font-medium animate-in fade-in duration-200">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Pricing & Escrow Requirements Section */}
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--paper)]/60 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">
                Agreed Proposal Price
              </span>
              <span className="font-display text-xl font-extrabold text-emerald-500">
                ₹{offerPrice.toLocaleString("en-IN")}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--line)]">
              <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-2.5">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                  Minimum to Pay
                </span>
                <span className="font-mono text-sm font-bold text-[var(--ink)]">
                  ₹{minRequiredToPay.toLocaleString("en-IN")}
                </span>
                <p className="mt-0.5 text-[10px] text-[var(--muted)]">Deal payout amount</p>
              </div>

              <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-2.5">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                  Max Escrow Buffer
                </span>
                <span className="font-mono text-sm font-bold text-[var(--ink)]">
                  ₹{maxPossibleWithSecurity.toLocaleString("en-IN")}
                </span>
                <p className="mt-0.5 text-[10px] text-[var(--muted)]">Includes max budget cap</p>
              </div>
            </div>

            {/* Wallet Balance Warning/Status */}
            <div className="flex items-center justify-between pt-1 text-xs">
              <div className="flex items-center gap-1.5 text-[var(--muted)]">
                <Coins className="h-3.5 w-3.5 text-amber-500" />
                <span>Your Available Balance:</span>
                <strong className="text-[var(--ink)]">₹{availableBalance.toLocaleString("en-IN")}</strong>
              </div>

              {!isBalanceSufficient && (
                <Link
                  to="/wallet"
                  className="text-xs font-bold text-amber-500 hover:underline flex items-center gap-1"
                >
                  <span>Top Up Wallet &rarr;</span>
                </Link>
              )}
            </div>
          </div>

          {/* Contact Exchange Details Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-[var(--ink)]">
                Your Private Contact & Meeting Info
              </label>
              <span className="text-[10px] font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Only for {offer.provider?.username || "Lender/Provider"}
              </span>
            </div>

            {/* Contact Method Selector */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: "whatsapp", label: "WhatsApp", icon: MessageSquare },
                { id: "call", label: "Phone Call", icon: Phone },
                { id: "instagram", label: "Instagram", icon: Instagram },
                { id: "telegram", label: "Telegram", icon: Send },
              ].map((platform) => {
                const Icon = platform.icon;
                const isSelected = contactPlatform === platform.id;
                return (
                  <button
                    key={platform.id}
                    type="button"
                    onClick={() => setContactPlatform(platform.id as any)}
                    className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl text-[11px] font-bold border transition cursor-pointer ${
                      isSelected
                        ? "bg-[var(--ink)] text-[var(--paper)] border-[var(--ink)] shadow-xs scale-102"
                        : "bg-[var(--surface)] text-[var(--muted)] border-[var(--line)] hover:text-[var(--ink)] hover:bg-[var(--line)]/40"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{platform.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Handle / Number Input */}
            <div>
              <label className="block text-[11px] font-semibold text-[var(--muted)] mb-1">
                {contactPlatform === "whatsapp" || contactPlatform === "call"
                  ? "Phone Number / WhatsApp Number"
                  : `${contactPlatform === "instagram" ? "Instagram" : "Telegram"} Username or Link`}
              </label>
              <input
                type="text"
                required
                value={contactHandle}
                onChange={(e) => setContactHandle(e.target.value)}
                placeholder={
                  contactPlatform === "whatsapp" || contactPlatform === "call"
                    ? "+91 98765 43210"
                    : "@your_handle or profile link"
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--paper)] text-xs font-semibold text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--ink)]/30 transition-all placeholder:text-[var(--muted)]"
              />
            </div>

            {/* Meeting Spot / Description Textarea */}
            <div>
              <label className="block text-[11px] font-semibold text-[var(--muted)] mb-1">
                Contact Description & Preferred Meeting Spot
              </label>
              <textarea
                rows={3}
                required
                value={contactNotes}
                onChange={(e) => setContactNotes(e.target.value)}
                placeholder="e.g. Call me on WhatsApp after 3 PM. We can meet outside Library Gate 2 or near the coffee stand for handoff."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--paper)] text-xs font-semibold text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--ink)]/30 transition-all placeholder:text-[var(--muted)] leading-relaxed"
              />
            </div>

            {/* Privacy Guarantee Note */}
            <div className="flex items-start gap-2 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-[11px] text-[var(--muted)] leading-relaxed">
              <Shield className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>
                <strong>Confidential Handoff:</strong> This contact detail and meeting description will ONLY be shown to the person lending/providing ({offer.provider?.username || "the provider"}). It is never visible on public feeds.
              </span>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-3 border-t border-[var(--line)] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 py-2 text-xs font-bold text-[var(--ink)] hover:bg-[var(--line)]/50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !isBalanceSufficient}
              className="rounded-full bg-emerald-600 hover:bg-emerald-700 px-5 py-2 text-xs font-bold text-white transition active:scale-95 disabled:opacity-50 cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              {loading ? (
                "Accepting..."
              ) : (
                <>
                  <span>Accept Offer (₹{offerPrice.toLocaleString("en-IN")})</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AcceptOfferModal;
