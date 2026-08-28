import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../redux/store";
import {
  fetchContractById,
  confirmContract,
  cancelContract,
  generateOTP,
  checkoutContract,
  returnContract,
  disputeCondition,
  rateContract,
  clearOTPDetails,
} from "../redux/slices/contractsSlice";
import { fetchDealById } from "../redux/slices/dealsSlice";
import { fetchWallet } from "../redux/slices/walletSlice";
import { useAuth } from "../hooks/useAuth";
import { StatusBadge } from "../components/common/StatusBadge";
import { toast } from "sonner";
import {
  ArrowLeft,
  Calendar,
  Lock,
  Shield,
  User,
  Star,
  MessageSquare,
  Phone,
  ShieldAlert,
  Hourglass,
  Check,
  ChevronRight,
  Copy,
  Plus,
  RefreshCw,
  Coins,
  CheckCircle2,
  AlertCircle,
  FileText,
} from "lucide-react";

export function ContractDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAuth();

  const { currentContract, otpDetails, actionLoading, error: contractError } = useAppSelector(
    (state) => state.contracts
  );
  const { currentDeal } = useAppSelector((state) => state.deals);

  const [cancelReason, setCancelReason] = useState("");
  const [showCancelModal, setShowCancelModal] = useState(false);

  const [otpInput, setOtpInput] = useState("");
  
  const [disputeReason, setDisputeReason] = useState<"damage" | "delay">("damage");
  const [disputeDescription, setDisputeDescription] = useState("");
  const [showDisputeModal, setShowDisputeModal] = useState(false);

  const [ratingScore, setRatingScore] = useState(5);
  const [ratingReview, setRatingReview] = useState("");
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  const [copiedOtp, setCopiedOtp] = useState(false);

  // Fetch contract and matching deal info
  useEffect(() => {
    if (id) {
      dispatch(fetchContractById(id)).unwrap().then((contract) => {
        dispatch(fetchDealById(contract.deal_id));
      });
      dispatch(clearOTPDetails());
    }
  }, [dispatch, id]);

  if (!currentContract) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-[var(--muted)] font-semibold">Loading contract ledger details...</p>
      </div>
    );
  }

  const isRequester = user?.id === currentContract.requester_id;
  const isProvider = user?.id === currentContract.provider_id;
  const otherPartyRole = isRequester ? "Lender/Provider" : "Borrower/Requester";

  // Mock contact lookup or generate if not stored in local storage
  const getContactDetails = () => {
    const stored = localStorage.getItem(`dealpool_contact_deal_${currentContract.deal_id}`) || 
                   localStorage.getItem(`dealpool_contact_offer_${currentContract.offer_id}`);
    
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {}
    }

    // Return reasonable fallback if localstorage is cleared
    return {
      platform: "whatsapp",
      handle: isRequester ? "+91 99887 76655" : "+91 91234 56789",
      notes: "Please call/WhatsApp to coordinate the exchange near the central square.",
    };
  };

  const contactInfo = getContactDetails();

  const handleConfirm = async () => {
    if (!id) return;
    try {
      await dispatch(confirmContract(id)).unwrap();
      toast.success("Agreement confirmed!");
      dispatch(fetchWallet());
    } catch (err: any) {
      toast.error(err || "Failed to confirm agreement");
    }
  };

  const handleCancel = async () => {
    if (!id) return;
    try {
      await dispatch(cancelContract({ id, reason: cancelReason })).unwrap();
      toast.success("Contract cancelled. Escrow refund processed.");
      setShowCancelModal(false);
      dispatch(fetchWallet());
    } catch (err: any) {
      toast.error(err || "Failed to cancel contract");
    }
  };

  const handleGenerateOTP = async () => {
    if (!id) return;
    const purpose = currentContract.status === "confirmed" ? "checkout" : "return";
    try {
      await dispatch(generateOTP({ id, purpose })).unwrap();
      toast.success(`Security code generated successfully!`);
    } catch (err: any) {
      toast.error(err || "Failed to generate security code");
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !otpInput.trim()) return;
    
    const isCheckout = currentContract.status === "confirmed";
    try {
      if (isCheckout) {
        await dispatch(checkoutContract({ id, code: otpInput.trim() })).unwrap();
        toast.success("Checkout verified! Custody transitioned.");
      } else {
        await dispatch(returnContract({ id, code: otpInput.trim() })).unwrap();
        toast.success("Return verified! Escrow released.");
        dispatch(fetchWallet());
      }
      setOtpInput("");
      dispatch(clearOTPDetails());
    } catch (err: any) {
      toast.error(err || "Incorrect or expired security code.");
    }
  };

  const handleDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !disputeDescription.trim()) return;
    try {
      await dispatch(
        disputeCondition({
          id,
          reason: disputeReason,
          description: disputeDescription.trim(),
        })
      ).unwrap();
      toast.success("Condition dispute filed. Locked escrow suspended pending admin resolution.");
      setShowDisputeModal(false);
      setDisputeDescription("");
    } catch (err: any) {
      toast.error(err || "Failed to submit dispute");
    }
  };

  const handleRating = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      await dispatch(rateContract({ id, score: ratingScore, review: ratingReview })).unwrap();
      toast.success("Thank you for your rating!");
      setRatingSubmitted(true);
    } catch (err: any) {
      toast.error(err || "Failed to submit rating. You might have already rated.");
    }
  };

  const handleCopyOtp = () => {
    if (otpDetails?.code) {
      navigator.clipboard.writeText(otpDetails.code);
      setCopiedOtp(true);
      setTimeout(() => setCopiedOtp(false), 2000);
    }
  };

  // Stepper lifecycle helper
  const getStepStatusClass = (step: number) => {
    const status = currentContract.status;
    if (step === 1) {
      if (status === "cancelled") return "bg-rose-500 text-white border-rose-500";
      if (status === "created" || status === "pending_confirmation") return "bg-[var(--ink)] text-[var(--paper)] border-[var(--ink)]";
      return "bg-emerald-500 text-white border-emerald-500";
    }
    if (step === 2) {
      if (status === "created" || status === "pending_confirmation" || status === "cancelled") return "border-[var(--line)] text-[var(--muted)] bg-[var(--paper)]";
      if (status === "confirmed") return "bg-[var(--ink)] text-[var(--paper)] border-[var(--ink)]";
      return "bg-emerald-500 text-white border-emerald-500";
    }
    if (step === 3) {
      if (status === "active") return "bg-[var(--ink)] text-[var(--paper)] border-[var(--ink)] animate-pulse";
      if (status === "returned" || status === "returned_pending_dispute" || status === "completed" || status === "disputed") {
        return "bg-emerald-500 text-white border-emerald-500";
      }
      return "border-[var(--line)] text-[var(--muted)] bg-[var(--paper)]";
    }
    if (step === 4) {
      if (status === "returned" || status === "returned_pending_dispute") return "bg-[var(--ink)] text-[var(--paper)] border-[var(--ink)]";
      if (status === "completed" || status === "disputed") return "bg-emerald-500 text-white border-emerald-500";
      return "border-[var(--line)] text-[var(--muted)] bg-[var(--paper)]";
    }
    return "border-[var(--line)] text-[var(--muted)] bg-[var(--paper)]";
  };

  const rentalFee = Number(currentContract.rental_fee || currentContract.lend_fee || 0);
  const securityDeposit = Number(currentContract.security_deposit || currentContract.security_amount || 0);
  const platformFee = Number(currentContract.platform_fee || 0);
  const totalEscrowed = rentalFee + securityDeposit;

  return (
    <div className="max-w-6xl mx-auto px-4 lg:px-8 py-6 space-y-6">
      {/* Back Button */}
      <div className="flex items-center justify-between">
        <Link
          to="/contracts"
          className="inline-flex items-center gap-2 text-xs font-bold text-[var(--muted)] hover:text-[var(--ink)] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Escrow Contracts</span>
        </Link>
        <span className="text-xs text-[var(--muted)] font-mono">
          Contract: #{currentContract.id.slice(0, 8)}
        </span>
      </div>

      {/* Main Grid: Info Cards and Stepper */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Escrow Stepper Status and Action flows */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Visual Lifecycle Stepper */}
          <div className="bg-[var(--surface)] p-6 rounded-3xl border border-[var(--line)] shadow-2xs space-y-5">
            <h2 className="font-display font-extrabold text-sm text-[var(--ink)] uppercase tracking-wider">
              Exchange Lifecycle Steps
            </h2>

            <div className="grid grid-cols-4 gap-2 relative">
              {[
                { label: "1. Confirm", step: 1 },
                { label: "2. Reveal", step: 2 },
                { label: "3. Handover", step: 3 },
                { label: "4. Return & End", step: 4 },
              ].map((s) => (
                <div key={s.step} className="flex flex-col items-center text-center space-y-2 relative z-10">
                  <div
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-xs transition-all duration-300 ${getStepStatusClass(
                      s.step
                    )}`}
                  >
                    {currentContract.status === "completed" && s.step < 5 ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      s.step
                    )}
                  </div>
                  <span className="text-[10px] font-bold text-[var(--ink)]">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Step 1: Confirmation Form (Active when created / pending_confirmation) */}
          {(currentContract.status === "created" || currentContract.status === "pending_confirmation") && (
            <div className="bg-[var(--surface)] p-6 rounded-3xl border border-[var(--line)] shadow-2xs space-y-4 animate-in fade-in duration-200">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 shrink-0">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[var(--ink)]">Two-Sided Agreement Confirmation</h3>
                  <p className="text-xs text-[var(--muted)] mt-1 font-normal leading-relaxed">
                    Both the Requester and Provider must confirm the contract terms to unlock contact exchange details and generate the checkout handover security code.
                  </p>
                </div>
              </div>

              {/* Status details */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-[var(--paper)] rounded-2xl border border-[var(--line)] text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] text-[var(--muted)] font-bold uppercase tracking-wider block">
                    Borrower Confirmed
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        currentContract.requester_confirmed ? "bg-emerald-500 animate-pulse" : "bg-zinc-400"
                      }`}
                    />
                    <span className="font-semibold">
                      {currentContract.requester_confirmed ? "Yes" : "Awaiting confirm"}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-[var(--muted)] font-bold uppercase tracking-wider block">
                    Lender Confirmed
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        currentContract.provider_confirmed ? "bg-emerald-500 animate-pulse" : "bg-zinc-400"
                      }`}
                    />
                    <span className="font-semibold">
                      {currentContract.provider_confirmed ? "Yes" : "Awaiting confirm"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Confirm actions */}
              <div className="pt-3 border-t border-[var(--line)] flex items-center justify-between gap-3">
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="px-4 py-2 border border-rose-500/30 text-rose-500 bg-rose-500/5 hover:bg-rose-500/10 text-xs font-bold rounded-xl cursor-pointer transition active:scale-95"
                >
                  Cancel Agreement
                </button>

                {((isRequester && !currentContract.requester_confirmed) ||
                  (isProvider && !currentContract.provider_confirmed)) && (
                  <button
                    onClick={handleConfirm}
                    disabled={actionLoading}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer transition active:scale-95 disabled:opacity-50"
                  >
                    Confirm Terms
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Contact Details & Handoff Info (Revealed when both confirmed / contact revealed) */}
          {currentContract.contact_revealed && currentContract.status !== "cancelled" && (
            <div className="bg-[var(--surface)] p-6 rounded-3xl border border-[var(--line)] shadow-2xs space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-500" />
                <h3 className="font-bold text-sm text-[var(--ink)]">Verified Private Contact Info</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[var(--paper)] border border-[var(--line)] flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shrink-0">
                    {contactInfo.platform === "whatsapp" ? <MessageSquare className="w-4.5 h-4.5" /> : <Phone className="w-4.5 h-4.5" />}
                  </div>
                  <div className="text-xs space-y-0.5">
                    <span className="text-[10px] text-[var(--muted)] font-bold uppercase tracking-wider block">
                      Contact Handle ({contactInfo.platform})
                    </span>
                    <a
                      href={contactInfo.platform === "whatsapp" || contactInfo.platform === "call" ? `tel:${contactInfo.handle}` : undefined}
                      className="font-bold text-sm text-[var(--ink)] hover:underline"
                    >
                      {contactInfo.handle}
                    </a>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[var(--paper)] border border-[var(--line)] flex items-start gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shrink-0 mt-0.5">
                    <Calendar className="w-4.5 h-4.5" />
                  </div>
                  <div className="text-xs space-y-1">
                    <span className="text-[10px] text-[var(--muted)] font-bold uppercase tracking-wider block">
                      Handoff Meeting Instructions
                    </span>
                    <p className="text-[11px] text-[var(--muted)] font-medium leading-relaxed">
                      {contactInfo.notes}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Secure Handoff Handshake (OTP Verify checkout/return) */}
          {(currentContract.status === "confirmed" || currentContract.status === "active") && (
            <div className="bg-[var(--surface)] p-6 rounded-3xl border border-[var(--line)] shadow-2xs space-y-5 animate-in fade-in duration-200">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shrink-0">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[var(--ink)]">
                    {currentContract.status === "confirmed" ? "Secure Handover Verification" : "Secure Return Verification"}
                  </h3>
                  <p className="text-xs text-[var(--muted)] mt-1 font-normal leading-relaxed">
                    {currentContract.status === "confirmed"
                      ? "To hand over the physical resource/service custody, the Lender must generate a security code and show/message it to the Borrower. The Borrower must input the code below."
                      : "When returning the resource/equipment, the Borrower must generate a security code. The Lender must input the code below to confirm they received the item back in good condition."}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {/* Side A: Generator (Lender for checkout, Borrower for return) */}
                <div className="p-5 rounded-2xl border border-[var(--line)] bg-[var(--paper)]/50 space-y-4 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-[var(--ink)] mb-1">
                      {currentContract.status === "confirmed" ? "Lender Actions" : "Borrower Actions"}
                    </h4>
                    <p className="text-[10px] text-[var(--muted)] font-normal leading-relaxed">
                      Generate and share the multi-sig secure handoff verification token.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {otpDetails?.code && (
                      <div className="p-3 bg-[var(--surface)] rounded-xl border border-[var(--line)] flex items-center justify-between gap-2 animate-in zoom-in-95 duration-150">
                        <div>
                          <span className="block text-[9px] text-[var(--muted)] font-bold uppercase tracking-wider">
                            Active Handoff OTP
                          </span>
                          <span className="font-mono text-lg font-black tracking-widest text-emerald-500">
                            {otpDetails.code}
                          </span>
                        </div>
                        <button
                          onClick={handleCopyOtp}
                          className="p-2 rounded-lg hover:bg-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)] transition-colors cursor-pointer"
                          title="Copy code"
                        >
                          {copiedOtp ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    )}

                    {((currentContract.status === "confirmed" && isProvider) ||
                      (currentContract.status === "active" && isRequester)) && (
                      <button
                        onClick={handleGenerateOTP}
                        disabled={actionLoading}
                        className="w-full py-2.5 rounded-xl bg-[var(--ink)] text-[var(--paper)] text-xs font-bold hover:opacity-90 active:scale-98 transition shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Generate Security Code</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Side B: Verifier (Borrower for checkout, Lender for return) */}
                <div className="p-5 rounded-2xl border border-[var(--line)] bg-[var(--paper)]/50 space-y-4">
                  <h4 className="font-bold text-xs text-[var(--ink)] mb-1">
                    {currentContract.status === "confirmed" ? "Borrower Actions" : "Lender Actions"}
                  </h4>
                  
                  {((currentContract.status === "confirmed" && isRequester) ||
                    (currentContract.status === "active" && isProvider)) ? (
                    <form onSubmit={handleVerifyOTP} className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider mb-1">
                          Enter Security Code
                        </label>
                        <input
                          type="text"
                          maxLength={6}
                          required
                          value={otpInput}
                          onChange={(e) => setOtpInput(e.target.value.toUpperCase())}
                          placeholder="HEX CODE"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-sm font-black tracking-widest text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all placeholder:text-[var(--muted)] text-center"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={actionLoading || !otpInput.trim()}
                        className="w-full py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 active:scale-98 transition shadow-2xs cursor-pointer disabled:opacity-50"
                      >
                        Verify & Transition Custody
                      </button>
                    </form>
                  ) : (
                    <div className="py-8 text-center text-xs text-[var(--muted)] font-normal leading-relaxed border border-dashed border-[var(--line)] rounded-xl bg-[var(--surface)]">
                      Waiting for the other party to provide verification code.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Dispute & Completed Step Options */}
          {(currentContract.status === "returned" ||
            currentContract.status === "returned_pending_dispute" ||
            currentContract.status === "disputed" ||
            currentContract.status === "completed") && (
            <div className="bg-[var(--surface)] p-6 rounded-3xl border border-[var(--line)] shadow-2xs space-y-5 animate-in fade-in duration-200">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[var(--ink)]">
                    {currentContract.status === "completed"
                      ? "Exchange Completed Successfully!"
                      : "Item Returned - Resolution Window Open"}
                  </h3>
                  <p className="text-xs text-[var(--muted)] mt-1 font-normal leading-relaxed">
                    {currentContract.status === "completed"
                      ? "The lending fee has been successfully credited to the provider and security deposits refunded to the borrower. Please submit your partner feedback below."
                      : "The item has been returned. A 24-hour review window is active for either party to file condition disputes. If no dispute is filed, escrow will automatically settle."}
                  </p>
                </div>
              </div>

              {/* Status details & dispute button */}
              {currentContract.status !== "completed" && (
                <div className="p-4 rounded-2xl bg-[var(--paper)] border border-[var(--line)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="text-xs space-y-0.5">
                    <span className="text-[10px] text-[var(--muted)] font-bold uppercase tracking-wider block">
                      Dispute Deadline
                    </span>
                    <span className="font-bold text-[var(--ink)]">
                      {currentContract.dispute_deadline
                        ? new Date(currentContract.dispute_deadline).toLocaleString()
                        : "24 Hours after return"}
                    </span>
                  </div>

                  {!currentContract.condition_disputed && currentContract.status !== "disputed" && (
                    <button
                      onClick={() => setShowDisputeModal(true)}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition active:scale-95 cursor-pointer shadow-2xs shrink-0"
                    >
                      File Damage/Delay Dispute
                    </button>
                  )}
                </div>
              )}

              {/* Ratings and review submission */}
              {currentContract.status === "completed" && (
                <div className="pt-2">
                  {ratingSubmitted ? (
                    <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl text-xs text-emerald-500 font-semibold flex items-center gap-2 animate-in zoom-in-95 duration-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>Your rating has been submitted. Thank you for building a trusted community!</span>
                    </div>
                  ) : (
                    <form onSubmit={handleRating} className="p-5 border border-[var(--line)] bg-[var(--paper)]/40 rounded-2xl space-y-4">
                      <h4 className="font-bold text-xs text-[var(--ink)] uppercase tracking-wider">
                        Rate Your Partner ({otherPartyRole})
                      </h4>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">
                          Rating Score
                        </label>
                        <div className="flex items-center gap-1.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setRatingScore(star)}
                              className="text-amber-500 hover:scale-110 transition cursor-pointer"
                            >
                              <Star
                                className={`w-6 h-6 ${
                                  star <= ratingScore ? "fill-amber-400 text-amber-500" : "text-[var(--line)]"
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">
                          Partner Review
                        </label>
                        <textarea
                          rows={3}
                          required
                          value={ratingReview}
                          onChange={(e) => setRatingReview(e.target.value)}
                          placeholder="How dependable was this exchange? Did the resource/service match descriptions? Meet on time?"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-xs font-semibold text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all placeholder:text-[var(--muted)] leading-relaxed"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={actionLoading}
                        className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition active:scale-95 cursor-pointer disabled:opacity-50"
                      >
                        Submit Feedback
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Escrow Ledger, Fees & Deal Overview */}
        <div className="lg:col-span-4 space-y-6">
          {/* Escrow Details */}
          <div className="bg-[var(--surface)] p-6 rounded-3xl border border-[var(--line)] shadow-2xs space-y-5">
            <div className="flex items-center gap-2 border-b border-[var(--line)] pb-3">
              <Lock className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
              <h3 className="font-display font-extrabold text-sm text-[var(--ink)]">
                Smart Escrow Ledger
              </h3>
            </div>

            <div className="space-y-3.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--muted)] font-medium">Rental / Lending Fee</span>
                <span className="font-bold text-[var(--ink)]">₹{rentalFee.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--muted)] font-medium">Security Deposit</span>
                <span className="font-bold text-[var(--ink)]">₹{securityDeposit.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--muted)] font-medium">Platform Fee (5%)</span>
                <span className="font-bold text-[var(--ink)]">₹{platformFee.toFixed(2)}</span>
              </div>

              <div className="pt-3 border-t border-[var(--line)] flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[var(--muted)] font-bold uppercase tracking-wider block">
                    Total Locked Escrow
                  </span>
                  <span className="text-[9px] text-[var(--muted)] font-normal">
                    Lend fee + Deposit rate ({((currentContract.security_deposit_rate || 0.15) * 100).toFixed(0)}%)
                  </span>
                </div>
                <span className="font-display text-lg font-extrabold text-emerald-500">
                  ₹{totalEscrowed.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Linked Deal card */}
          {currentDeal && (
            <div className="bg-[var(--surface)] rounded-3xl overflow-hidden border border-[var(--line)] shadow-2xs">
              <div className="relative h-28 w-full overflow-hidden bg-[var(--paper)]">
                <img
                  src={currentDeal.image_url || "/assets/placeholder-category.png"}
                  alt={currentDeal.title}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80";
                  }}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 pointer-events-none" />
                <div className="absolute top-3 left-3">
                  <span className="bg-black/60 backdrop-blur-xs text-white text-[9px] font-bold px-2 py-0.5 rounded-full border border-white/20 uppercase tracking-wider">
                    {currentDeal.category}
                  </span>
                </div>
              </div>

              <div className="p-5 space-y-3">
                <h4 className="font-bold text-sm text-[var(--ink)] leading-snug line-clamp-2">
                  {currentDeal.title}
                </h4>
                <p className="text-[11px] text-[var(--muted)] line-clamp-3 leading-relaxed font-normal">
                  {currentDeal.description}
                </p>
                <div className="pt-2 border-t border-[var(--line)]">
                  <Link
                    to={`/deals/${currentDeal.id}`}
                    className="text-xs font-bold text-emerald-500 hover:underline flex items-center gap-1"
                  >
                    <span>View Public Need Detail</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] p-6 shadow-2xl">
            <h3 className="font-display text-base font-bold text-[var(--ink)]">Cancel Agreement</h3>
            <p className="text-xs text-[var(--muted)] mt-1 font-normal leading-relaxed">
              Are you sure you want to cancel? If you cancel after accepting the offer, a **10% platform cancellation fee** (₹{(totalEscrowed * 0.1).toFixed(2)}) will be captured. The remaining 90% will be refunded to the borrower's wallet.
            </p>

            <div className="mt-4 space-y-3">
              <label className="block text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">
                Reason for cancellation
              </label>
              <textarea
                rows={2}
                required
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g. Change of plans / partner is unresponsive"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--paper)] text-xs font-semibold text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all placeholder:text-[var(--muted)] leading-relaxed"
              />
            </div>

            <div className="mt-5 pt-3 border-t border-[var(--line)] flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 py-2 text-xs font-bold text-[var(--ink)] hover:bg-[var(--line)]/50 transition cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={actionLoading || !cancelReason.trim()}
                className="rounded-full bg-rose-600 hover:bg-rose-700 px-5 py-2 text-xs font-bold text-white transition active:scale-95 disabled:opacity-50 cursor-pointer shadow-xs"
              >
                Confirm Cancel (10% Fee Capture)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dispute Modal */}
      {showDisputeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <form onSubmit={handleDispute} className="relative w-full max-w-md overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] p-6 shadow-2xl space-y-4">
            <h3 className="font-display text-base font-bold text-[var(--ink)] flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-500" />
              <span>File Condition Dispute</span>
            </h3>
            
            <p className="text-xs text-[var(--muted)] font-normal leading-relaxed">
              If the resource was damaged during exchange, or terms were violated, you can file a dispute. Platform governance will review the dispute and release deposits appropriately.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider mb-1">
                  Dispute Type
                </label>
                <select
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--paper)] text-xs font-bold text-[var(--ink)] focus:outline-none"
                >
                  <option value="damage">Physical Damage / Wear</option>
                  <option value="delay">Return Delay / Unresponsive</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider mb-1">
                  Dispute Details & Description
                </label>
                <textarea
                  rows={3}
                  required
                  value={disputeDescription}
                  onChange={(e) => setDisputeDescription(e.target.value)}
                  placeholder="Explain exactly what happened, and detail any damage or terms violated..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--paper)] text-xs font-semibold text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-rose-500/30 transition-all placeholder:text-[var(--muted)] leading-relaxed"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-[var(--line)] flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowDisputeModal(false)}
                className="rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 py-2 text-xs font-bold text-[var(--ink)] hover:bg-[var(--line)]/50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading || !disputeDescription.trim()}
                className="rounded-full bg-rose-600 hover:bg-rose-700 px-5 py-2 text-xs font-bold text-white transition active:scale-95 disabled:opacity-50 cursor-pointer shadow-xs"
              >
                Submit Dispute Report
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default ContractDetail;
