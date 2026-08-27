import React from "react";
import { Loader2 } from "lucide-react";
import logoImg from "../../assets/dealpool-logo.png";

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[var(--paper)] text-[var(--ink)] antialiased transition-colors duration-200">
      <div className="relative flex flex-col items-center max-w-xs text-center space-y-4">
        {/* Animated Brand Pulse */}
        <div className="relative flex items-center justify-center">
          <span className="w-20 h-20 rounded-full bg-emerald-500/10 animate-ping absolute" />
          <div className="relative w-16 h-16 rounded-2xl bg-[var(--surface)] border border-[var(--line)] flex items-center justify-center shadow-lg">
            <img src={logoImg} alt="DealPool Logo" className="w-10 h-10 object-contain" />
          </div>
        </div>

        <div className="space-y-1">
          <h2 className="font-display font-extrabold text-lg tracking-tight text-[var(--ink)]">
            Loading DealPool...
          </h2>
          <p className="text-xs text-[var(--muted)] leading-relaxed">
            Securing your connection and fetching neighborhood radar...
          </p>
        </div>

        <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
      </div>
    </div>
  );
}

export default LoadingScreen;
