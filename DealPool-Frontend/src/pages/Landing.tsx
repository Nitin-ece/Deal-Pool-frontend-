import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowRight,
  ShieldCheck,
  KeyRound,
  Wallet,
  LogIn,
  UserPlus,
  Compass,
  CheckCircle2,
  Lock,
  Sparkles,
  MapPin,
  HelpCircle,
  ChevronDown,
  Calculator,
  Layers,
  ArrowUpRight,
  Flame,
  Check,
  X,
  Eye,
  Sliders,
  ShieldAlert,
  Coins,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { BrandMark } from "../components/common/BrandMark";
import { MaskedHeading } from "../components/common/MaskedHeading";
import { DotGridBG } from "../components/common/DotGridBG";
import { Meteors } from "@/registry/magicui/meteors";

const HERO_BACKDROP =
  "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1800&auto=format&fit=crop&q=80";

const PILLARS = [
  {
    icon: Wallet,
    step: "01",
    title: "100% Escrow Protection",
    desc: "Coins and security deposits stay locked in verifiable ledger escrow from the moment an offer is accepted until handoff return.",
    tag: "Cryptographic Ledger",
  },
  {
    icon: ShieldCheck,
    step: "02",
    title: "Two-Sided Agreement",
    desc: "Personal contact details are never leaked. Contact unlocks strictly after both requester and provider sign the deal.",
    tag: "Zero-Leak Privacy",
  },
  {
    icon: KeyRound,
    step: "03",
    title: "Cryptographic OTP Handoff",
    desc: "Physical handoff & return require an on-the-spot 6-character OTP validation to prevent ghosting or unilateral claims.",
    tag: "Dual Verification",
  },
  {
    icon: Compass,
    step: "04",
    title: "Zero-Search GPS Discovery",
    desc: "Live radar detects gear within your radius instantly. No manual typing or fake presets required.",
    tag: "Live Perimeter",
  },
];

const FAQS = [
  {
    q: "How does the coin escrow protect my gear?",
    a: "When a borrower accepts or makes an offer, their coin deposit is immediately frozen in the DealPool ledger. The lender is guaranteed compensation if the tool is damaged or not returned, while the borrower is protected from unilateral cancellations.",
  },
  {
    q: "What is the 6-character OTP handoff?",
    a: "During physical meetup, the borrower inspects the item and provides a dynamic 6-character code shown in their app. When entered by the lender, custody is transferred atomically in the database.",
  },
  {
    q: "Are my phone number and location exposed?",
    a: "Never before an agreement is signed. The live radar shows only approximate neighborhood sectors (e.g. within 3 km). Full contact coordinates unlock only after both parties seal the contract.",
  },
  {
    q: "What happens if an item is returned damaged?",
    a: "Lenders have a 24-hour inspection window following the return handoff to file a Condition Report with photos. Escrow funds remain frozen until mutual settlement or admin arbitration.",
  },
];

const SIMULATOR_PRESETS = [
  { name: "Heavy SDS Rotary Hammer Drill", basePrice: 400, deposit: 1200, category: "Power Tools" },
  { name: "DeWalt 12\" Compound Miter Saw", basePrice: 550, deposit: 1800, category: "Woodworking" },
  { name: "Sony FX3 Cinema Rig + Lens", basePrice: 1500, deposit: 6000, category: "Audio/Video" },
  { name: "Self-Propelled Lawn Aerator", basePrice: 350, deposit: 1000, category: "Lawn & Garden" },
  { name: "Thermal Imaging Fluke Camera", basePrice: 700, deposit: 2500, category: "Diagnostic" },
];

export function Landing() {
  const navigate = useNavigate();
  const { user, checkAuth, initialized } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Live Simulator state
  const [simIndex, setSimIndex] = useState(0);
  const [simDays, setSimDays] = useState(3);

  const currentSim = SIMULATOR_PRESETS[simIndex];
  const totalRental = currentSim.basePrice * simDays;
  const platformFee = Math.round(totalRental * 0.05);
  const lenderNet = totalRental - platformFee;
  const totalEscrowLocked = totalRental + currentSim.deposit;

  useEffect(() => {
    if (!initialized) checkAuth();
  }, [checkAuth, initialized]);

  useEffect(() => {
    if (user) navigate("/deals", { replace: true });
  }, [user, navigate]);

  return (
    <div className="relative min-h-screen bg-black text-[#f4f4f5] selection:bg-white selection:text-black antialiased overflow-x-hidden">
      {/* Interactive Dot Grid Background */}
      <DotGridBG gap={26} dotSize={1.5} />

      {/* MagicUI Meteors Background Effect */}
      <Meteors number={30} />

      {/* Top Header */}
      <header className="relative z-30 mx-auto flex max-w-7xl items-center justify-between px-5 py-6 sm:px-8">
        <BrandMark inverted size="md" />

        <div className="flex items-center gap-3">
          <Link
            to="/deals"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-neutral-900/80 px-4 py-2 text-xs font-bold text-white backdrop-blur-md transition hover:border-emerald-400 hover:bg-neutral-800 shadow-sm"
          >
            <Compass className="h-3.5 w-3.5 text-emerald-400" />
            <span>Open Radar</span>
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold text-white/90 transition hover:bg-white/10 hover:text-white"
          >
            <LogIn className="h-3.5 w-3.5" />
            <span>Sign In</span>
          </Link>
          <Link
            to="/register"
            className="inline-flex items-center gap-1.5 rounded-full bg-white-forced px-4 py-2 text-xs font-extrabold transition hover:bg-neutral-200 active:scale-95 shadow-md"
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>Get Started</span>
          </Link>
        </div>
      </header>

      {/* Hero Section with MaskedHeading */}
      <section className="relative z-20 mx-auto flex max-w-6xl flex-col items-center justify-center px-5 pt-12 pb-24 text-center sm:px-8 sm:pt-20 sm:pb-32">
        {/* Micro-badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-[11px] font-medium text-white/80 backdrop-blur-md"
        >
          <span className="flex h-2 w-2 rounded-full bg-emerald-400"></span>
          <span>Hyperlocal Tool & Resource Exchange</span>
          <span className="text-white/30">•</span>
          <span className="text-white/60">Escrow-Backed</span>
        </motion.div>

        {/* MaskedHeading Integration */}
        <div className="w-full max-w-5xl my-2">
          <MaskedHeading
            tag="h1"
            text="DealPool Neighborhood Exchange"
            src={HERO_BACKDROP}
            fillScale={1.3}
            parallax={32}
            drift={14}
            reveal="rise"
            trigger="mount"
            duration={1.2}
            textScale={0.088}
            className="font-display font-extrabold tracking-tight uppercase"
            style={{ color: "#ffffff" }}
          />
        </div>

        {/* Hero Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.6 }}
          className="mt-6 max-w-2xl text-base leading-relaxed text-zinc-300 sm:text-lg"
        >
          Borrow high-value tools, equipment, and resources from nearby neighbors with
          automatic coin escrow, OTP handoff security, and verified multi-hop chains.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3.5"
        >
          <Link
            to="/register"
            className="group inline-flex items-center gap-2 rounded-full bg-white-forced px-7 py-3.5 text-sm font-extrabold transition-all hover:bg-neutral-200 active:scale-95 shadow-xl cursor-pointer"
          >
            <span>Create Free Account</span>
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </Link>
          <Link
            to="/deals"
            className="inline-flex items-center gap-2 rounded-full border border-neutral-700 bg-neutral-900/90 px-6 py-3.5 text-sm font-bold text-white backdrop-blur-md transition hover:border-emerald-400 hover:bg-neutral-800 active:scale-95 shadow-lg cursor-pointer"
          >
            <Compass className="h-4 w-4 text-emerald-400" />
            <span>Launch Live Radar</span>
          </Link>
        </motion.div>

        {/* Live Feature Highlights Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.6 }}
          className="mt-16 grid w-full max-w-4xl grid-cols-2 gap-3 sm:grid-cols-4"
        >
          {[
            { label: "Sign-up Grant", value: "₹1,000 Coins" },
            { label: "Handoff Protocol", value: "Dual OTP Verified" },
            { label: "Custody Security", value: "Locked Escrow" },
            { label: "Location Mode", value: "Live GPS Auto" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left backdrop-blur-sm transition hover:border-white/20 hover:bg-white/[0.05]"
            >
              <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                {stat.label}
              </p>
              <p className="mt-1 text-sm font-bold text-white sm:text-base">{stat.value}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Interactive Architecture & Flow Section */}
      <section className="relative z-20 border-t border-white/10 bg-[#0c111a] px-5 py-24 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-xl">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
              Protocol Architecture
            </span>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Built like a true exchange, not a classifieds board.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400">
              Every loan transaction executes through automated escrow state machines with
              built-in deposit rate tiers and dispute resolution.
            </p>
          </div>

          {/* Grid of Core Pillars */}
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PILLARS.map((pillar, i) => {
              const Icon = pillar.icon;
              return (
                <motion.div
                  key={pillar.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                  className="group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.02] p-6 transition-all duration-300 hover:border-white/25 hover:bg-white/[0.05]"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white transition group-hover:border-white/25 group-hover:scale-110">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="font-mono text-xs font-bold text-zinc-400">
                        {pillar.step}
                      </span>
                    </div>
                    <h3 className="mt-5 font-display text-base font-bold text-white">
                      {pillar.title}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-zinc-400">{pillar.desc}</p>
                  </div>

                  <div className="mt-6 flex items-center justify-between text-[11px] font-semibold text-zinc-500">
                    <span className="rounded-md bg-white/5 px-2 py-0.5 text-zinc-300">
                      {pillar.tag}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 text-white/40 group-hover:text-white transition-colors" />
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Interactive Escrow Lifecycle Visualizer */}
          <div className="mt-16 rounded-3xl border border-white/10 bg-white/[0.02] p-6 sm:p-10 backdrop-blur-md">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-6">
              <div>
                <h3 className="font-display text-xl font-bold text-white">
                  Live Contract Lifecycle State Machine
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Click any stage to inspect the escrow and cryptographic custody guarantees.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  "1. Create Need",
                  "2. Sealed Escrow",
                  "3. Dual Sign",
                  "4. OTP Handoff",
                  "5. Return & Settle",
                ].map((label, idx) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setActiveStep(idx)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
                      activeStep === idx
                        ? "bg-white-forced font-bold shadow-md"
                        : "border border-white/10 text-zinc-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-6 grid gap-6 sm:grid-cols-3 text-left">
              <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">
                  Custody Status
                </span>
                <p className="mt-2 text-sm font-bold text-white">
                  {activeStep === 0
                    ? "Listing Open (Owned by Creator)"
                    : activeStep === 1
                    ? "Fee Captured & Escrow Locked"
                    : activeStep === 2
                    ? "Two-Sided Sealed Agreement"
                    : activeStep === 3
                    ? "In Custody of Borrower"
                    : "Returned & Settled"}
                </p>
                <p className="mt-1 text-xs text-zinc-400">
                  {activeStep === 0
                    ? "Resource listed within live discovery perimeter."
                    : activeStep === 1
                    ? "5% platform fee recorded and security deposit frozen in ledger."
                    : activeStep === 2
                    ? "Both parties signed, unlocking direct contact coordinates."
                    : activeStep === 3
                    ? "6-character OTP validated on physical inspection."
                    : "Escrow funds released safely back to participants."}
                </p>
              </div>

              <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">
                  Privacy Guarantee
                </span>
                <p className="mt-2 text-sm font-bold text-white">
                  {activeStep < 2 ? "Protected & Redacted" : "Revealed for Direct Pickup"}
                </p>
                <p className="mt-1 text-xs text-zinc-400">
                  Zero phone number or address leakage before mutual confirmation. Multi-hop chains
                  preserve identity confidentiality.
                </p>
              </div>

              <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-400">
                  Dispute Window
                </span>
                <p className="mt-2 text-sm font-bold text-white">24-Hour Inspection Guarantee</p>
                <p className="mt-1 text-xs text-zinc-400">
                  Lenders have 24 hours post-return to file condition reports with photographic
                  evidence and damage award claims.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Escrow & Fee Calculator Simulator */}
      <section className="relative z-20 border-t border-white/10 bg-black px-5 py-24 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
                Transparent Economics
              </span>
              <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Escrow & Fee Simulator
              </h2>
              <p className="mt-3 text-sm text-zinc-400 max-w-lg">
                See exactly how coins, security deposits, and lender payouts are calculated with zero hidden deductions.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400">Sample Tool:</span>
              <select
                value={simIndex}
                onChange={(e) => setSimIndex(Number(e.target.value))}
                className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white outline-none cursor-pointer"
              >
                {SIMULATOR_PRESETS.map((p, idx) => (
                  <option key={p.name} value={idx} className="bg-black text-white">
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {/* Controls */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 space-y-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">Selected Item</p>
                <p className="mt-1 text-base font-bold text-white">{currentSim.name}</p>
                <span className="mt-1 inline-block rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-zinc-300">
                  {currentSim.category}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-zinc-400">Rental Duration</span>
                  <span className="text-white font-mono">{simDays} {simDays === 1 ? "day" : "days"}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="14"
                  value={simDays}
                  onChange={(e) => setSimDays(Number(e.target.value))}
                  className="w-full accent-white cursor-pointer"
                />
              </div>

              <div className="rounded-2xl bg-white/[0.03] p-4 text-xs space-y-2 text-zinc-400">
                <div className="flex justify-between">
                  <span>Daily Rate:</span>
                  <span className="font-mono text-white">₹{currentSim.basePrice} / day</span>
                </div>
                <div className="flex justify-between">
                  <span>Refundable Security Deposit:</span>
                  <span className="font-mono text-white">₹{currentSim.deposit}</span>
                </div>
              </div>
            </div>

            {/* Breakdown */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 space-y-4">
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">Escrow Ledger Breakdown</p>
              
              <div className="space-y-3 pt-2">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Gross Rental (₹{currentSim.basePrice} × {simDays}d)</span>
                  <span className="font-mono font-bold text-white">₹{totalRental}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Held Security Deposit (Refundable)</span>
                  <span className="font-mono font-bold text-emerald-400">₹{currentSim.deposit}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Platform Insurance (5%)</span>
                  <span className="font-mono font-bold text-zinc-300">₹{platformFee}</span>
                </div>
                <div className="border-t border-white/10 pt-3 flex justify-between text-sm">
                  <span className="font-bold text-white">Total Locked Escrow</span>
                  <span className="font-mono font-extrabold text-amber-400">₹{totalEscrowLocked}</span>
                </div>
              </div>
            </div>

            {/* Summary Card */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                  Lender Net Yield
                </span>
                <p className="mt-2 font-display text-4xl font-extrabold text-white">
                  ₹{lenderNet} <span className="text-xs font-sans font-normal text-zinc-400">in verified coins</span>
                </p>
                <p className="mt-3 text-xs text-zinc-400 leading-relaxed">
                  Funds transfer automatically upon borrower return OTP confirmation. Deposit returns in full if no condition dispute is raised.
                </p>
              </div>

              <div className="pt-6">
                <Link
                  to="/register"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-white-forced px-5 py-3 text-xs font-bold transition hover:bg-zinc-200"
                >
                  <Coins className="h-4 w-4" />
                  <span>Start Listing & Earning</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison: Traditional vs DealPool */}
      <section className="relative z-20 border-t border-white/10 bg-[#0c111a] px-5 py-24 sm:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="text-center max-w-xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
              Why DealPool
            </span>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Engineered for neighborhood trust
            </h2>
          </div>

          <div className="mt-12 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02]">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.03]">
                  <th className="p-4 sm:p-5 font-bold text-zinc-400">Feature</th>
                  <th className="p-4 sm:p-5 font-bold text-zinc-400">Classifieds / Social Groups</th>
                  <th className="p-4 sm:p-5 font-bold text-white bg-white/[0.04]">DealPool Protocol</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[
                  {
                    feature: "Payment & Deposit Security",
                    bad: "Unprotected cash or trust transfers",
                    good: "Verifiable ledger escrow holding 100% deposit",
                  },
                  {
                    feature: "Contact Privacy",
                    bad: "Phone & exact home leaked to public",
                    good: "Redacted until mutual two-sided confirmation",
                  },
                  {
                    feature: "Handoff Proof",
                    bad: "No timestamp or physical record",
                    good: "Dual-OTP verification on spot",
                  },
                  {
                    feature: "Dispute Window",
                    bad: "Ghosting / no recourse",
                    good: "24-hr post-return condition inspection & frozen escrow",
                  },
                  {
                    feature: "Discovery Method",
                    bad: "Manual searching through stale posts",
                    good: "Live GPS radar with radius perimeter",
                  },
                ].map((row) => (
                  <tr key={row.feature} className="hover:bg-white/[0.01] transition-colors">
                    <td className="p-4 sm:p-5 font-semibold text-white">{row.feature}</td>
                    <td className="p-4 sm:p-5 text-zinc-400">
                      <div className="flex items-center gap-2">
                        <X className="h-4 w-4 text-rose-500 shrink-0" />
                        <span>{row.bad}</span>
                      </div>
                    </td>
                    <td className="p-4 sm:p-5 text-white font-medium bg-white/[0.02]">
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                        <span>{row.good}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative z-20 border-t border-white/10 bg-black px-5 py-24 sm:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">FAQ</span>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="mt-12 space-y-3">
            {FAQS.map((faq, idx) => (
              <div
                key={faq.q}
                className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden transition hover:border-white/20"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-5 text-left font-bold text-sm text-white flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-zinc-400 transition-transform duration-200 shrink-0 ${
                      openFaq === idx ? "rotate-180 text-white" : ""
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-zinc-400 leading-relaxed border-t border-white/5 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA & Community Banner */}
      <section className="relative z-20 border-t border-white/10 bg-black px-5 py-20 text-center sm:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Start sharing gear in your neighborhood today.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-sm text-zinc-300">
            Join thousands of makers and craftsmen keeping high-utility tools in circulation with
            complete peace of mind.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-full bg-white-forced px-7 py-3.5 text-sm font-extrabold transition hover:bg-neutral-200 active:scale-95 shadow-xl cursor-pointer"
            >
              <span>Get 1,000 Free Coins</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/deals"
              className="inline-flex items-center gap-2 rounded-full border border-neutral-700 bg-neutral-900/90 px-6 py-3.5 text-sm font-bold text-white transition hover:border-emerald-400 hover:bg-neutral-800 active:scale-95 shadow-lg cursor-pointer"
            >
              <span>Explore Active Needs</span>
            </Link>
          </div>

          <p className="mt-12 text-xs font-medium text-zinc-500">
            DealPool Hyperlocal Resource Protocol · Secure Ledger Escrow
          </p>
        </div>
      </section>
    </div>
  );
}

export default Landing;

