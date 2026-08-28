import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Compass,
  FileText,
  FolderHeart,
  PlusCircle,
  Settings,
  Shield,
  Coins,
  MapPin,
  Moon,
  Sun,
  LogOut,
  ChevronDown,
  Search,
  Sliders,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useGeolocation } from "../../hooks/useGeolocation";
import { useTheme } from "../../hooks/useTheme";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { setSearchQuery, setRadiusKm } from "../../redux/slices/dealsSlice";
import { fetchWallet } from "../../redux/slices/walletSlice";
import { BrandMark } from "../common/BrandMark";
import { GooeyNav, GooeyNavItem } from "../common/GooeyNav";
import { cn } from "../../lib/cn";

export function AppNavbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, isAdmin, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { userLocation, requestBrowserLocation, geoStatus } = useGeolocation();

  const radiusKm = useAppSelector((state) => state.deals.radiusKm);
  const searchQuery = useAppSelector((state) => state.deals.searchQuery);
  const wallet = useAppSelector((state) => state.wallet.summary);
  const pulseTrigger = useAppSelector((state) => state.wallet.pulseTrigger);

  const [showRadiusDropdown, setShowRadiusDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);

  const navContainerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (user) {
      dispatch(fetchWallet());
    }
  }, [user, dispatch]);

  useEffect(() => {
    if (pulseTrigger > 0) {
      setIsPulsing(true);
      const timer = setTimeout(() => setIsPulsing(false), 1200);
      return () => clearTimeout(timer);
    }
  }, [pulseTrigger]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!navContainerRef.current?.contains(e.target as Node)) {
        setShowRadiusDropdown(false);
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const closeAllMenus = () => {
    setShowRadiusDropdown(false);
    setShowUserMenu(false);
    setShowMobileMenu(false);
  };

  const navItems: GooeyNavItem[] = [
    { label: "Radar", href: "/deals", icon: Compass },
    { label: "Post Need", href: "/deals/new", icon: PlusCircle },
    { label: "My Deals", href: "/my-deals", icon: FolderHeart },
    { label: "Contracts", href: "/contracts", icon: FileText },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  if (isAdmin) {
    navItems.push({ label: "Admin", href: "/admin", icon: Shield });
  }

  return (
    <header
      ref={navContainerRef}
      className="sticky top-0 z-40 w-full border-b border-[var(--line)] bg-[var(--surface)]/90 backdrop-blur-xl transition-colors duration-200"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-4 shrink-0">
          <BrandMark size="sm" to={user ? "/deals" : "/"} />
        </div>

        {/* Center: GooeyNav Navigation Bar (Desktop & Tablets) */}
        <div className="hidden md:flex items-center justify-center flex-1">
          <GooeyNav
            items={navItems}
            particleCount={15}
            particleDistances={[90, 10]}
            particleR={100}
            initialActiveIndex={0}
            animationTime={600}
            timeVariance={300}
            colors={[1, 2, 3, 1, 2, 3, 1, 4]}
          />
        </div>

        {/* Right: Actions, Location, Coins, Theme & Avatar */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Location Chip */}
          <button
            type="button"
            id="navbar-location-btn"
            onClick={() => requestBrowserLocation()}
            disabled={geoStatus === "requesting"}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-1.5 text-xs font-semibold text-[var(--ink)] transition-all hover:bg-[var(--line)]/30 active:scale-95 cursor-pointer shadow-2xs"
            title={
              userLocation.cityName
                ? `GPS Active: ${userLocation.cityName}`
                : "Click to enable current location"
            }
          >
            <MapPin
              className={cn(
                "h-3.5 w-3.5 shrink-0",
                userLocation.cityName ? "text-emerald-500" : "text-[var(--muted)]"
              )}
            />
            <span className="max-w-[85px] lg:max-w-[130px] truncate text-[11px]">
              {geoStatus === "requesting"
                ? "Locating…"
                : userLocation.cityName || "Enable GPS"}
            </span>
            {userLocation.cityName && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            )}
          </button>

          {/* Radius Selector */}
          <div className="relative hidden xl:block">
            <button
              type="button"
              id="navbar-radius-selector"
              onClick={() => {
                setShowRadiusDropdown((v) => !v);
                setShowUserMenu(false);
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-[var(--line)] bg-[var(--surface)] px-2.5 py-1.5 text-xs font-semibold text-[var(--ink)] transition-all hover:bg-[var(--line)]/30 cursor-pointer shadow-2xs"
            >
              <Sliders className="h-3 w-3 text-[var(--muted)]" />
              <span className="text-[11px]">{radiusKm} km</span>
              <ChevronDown className="h-3 w-3 text-[var(--muted)]" />
            </button>
            {showRadiusDropdown && (
              <div className="absolute right-0 mt-2 w-36 overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-1.5 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                {[3, 5, 8, 15, 25].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      dispatch(setRadiusKm(r));
                      setShowRadiusDropdown(false);
                    }}
                    className={cn(
                      "flex w-full items-center justify-between rounded-xl px-3 py-1.5 text-xs transition cursor-pointer",
                      radiusKm === r
                        ? "bg-[var(--ink)] font-bold text-[var(--paper)]"
                        : "text-[var(--ink)] hover:bg-[var(--line)]/40"
                    )}
                  >
                    <span>{r} km</span>
                    {radiusKm === r && <span className="text-[10px]">●</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            type="button"
            id="navbar-theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] transition-all hover:bg-[var(--line)]/40 hover:scale-105 active:scale-95 cursor-pointer shadow-2xs"
            title={`Switch to ${isDark ? "Light" : "Dark"} Mode`}
          >
            {isDark ? (
              <Sun className="h-3.5 w-3.5 text-amber-400" />
            ) : (
              <Moon className="h-3.5 w-3.5 text-[var(--ink)]" />
            )}
          </button>

          {/* Wallet Balance Pill */}
          {user && (
            <Link
              to="/wallet"
              id="navbar-wallet-btn"
              className={cn(
                "group relative inline-flex items-center gap-1.5 rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-1.5 text-xs font-bold text-[var(--ink)] transition-all duration-200 hover:border-emerald-500 hover:shadow-xs active:scale-95 shadow-2xs",
                isPulsing && "ring-2 ring-emerald-400 bg-emerald-500/10 scale-105"
              )}
            >
              <Coins
                className={cn(
                  "h-3.5 w-3.5 text-amber-500 transition-transform group-hover:scale-110",
                  isPulsing && "animate-bounce text-emerald-400"
                )}
              />
              <span className="text-[11px] font-extrabold text-[var(--ink)]">
                ₹{Math.round(Number(wallet?.balance ?? 0)).toLocaleString("en-IN")}
              </span>
            </Link>
          )}

          {/* Post Need CTA */}
          <Link
            to="/deals/new"
            id="navbar-post-cta"
            className="hidden lg:inline-flex items-center gap-1.5 rounded-full bg-[var(--ink)] px-3.5 py-1.5 text-xs font-bold text-[var(--paper)] transition-all hover:opacity-90 active:scale-95 shadow-2xs"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>Post Need</span>
          </Link>

          {/* User Profile Avatar Popover */}
          {user ? (
            <div className="relative">
              <button
                type="button"
                id="navbar-user-avatar"
                onClick={() => {
                  setShowUserMenu((v) => !v);
                  setShowRadiusDropdown(false);
                }}
                className="flex items-center gap-1.5 rounded-full border border-[var(--line)] bg-[var(--surface)] p-1 transition hover:bg-[var(--line)]/30 cursor-pointer shadow-2xs"
              >
                {user.profile_photo ? (
                  <img
                    src={user.profile_photo}
                    alt=""
                    className="h-6 w-6 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--ink)] text-[11px] font-bold text-[var(--paper)]">
                    {user.username.slice(0, 1).toUpperCase()}
                  </span>
                )}
                <ChevronDown className="mr-0.5 h-3 w-3 text-[var(--muted)]" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-60 overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="border-b border-[var(--line)] px-3 pb-2.5 pt-1.5">
                    <p className="truncate text-xs font-bold text-[var(--ink)]">
                      {user.username}
                    </p>
                    <p className="truncate text-[10px] text-[var(--muted)]">{user.email}</p>
                    {isAdmin && (
                      <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-500">
                        <Shield className="h-3 w-3" />
                        Admin Access
                      </span>
                    )}
                  </div>

                  <div className="py-1.5 space-y-0.5">
                    <Link
                      to="/wallet"
                      onClick={closeAllMenus}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-[var(--ink)] transition hover:bg-[var(--line)]/40"
                    >
                      <Coins className="h-3.5 w-3.5 text-amber-500" />
                      <span>Wallet & Coin Ledger</span>
                    </Link>
                    <Link
                      to="/my-deals"
                      onClick={closeAllMenus}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-[var(--ink)] transition hover:bg-[var(--line)]/40"
                    >
                      <FolderHeart className="h-3.5 w-3.5 text-[var(--muted)]" />
                      <span>My Listed Needs</span>
                    </Link>
                    <Link
                      to="/contracts"
                      onClick={closeAllMenus}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-[var(--ink)] transition hover:bg-[var(--line)]/40"
                    >
                      <FileText className="h-3.5 w-3.5 text-[var(--muted)]" />
                      <span>My Contracts</span>
                    </Link>
                    <Link
                      to="/settings"
                      onClick={closeAllMenus}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-[var(--ink)] transition hover:bg-[var(--line)]/40"
                    >
                      <Settings className="h-3.5 w-3.5 text-[var(--muted)]" />
                      <span>Account Settings</span>
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={closeAllMenus}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-emerald-500 transition hover:bg-emerald-500/10"
                      >
                        <Shield className="h-3.5 w-3.5" />
                        <span>Admin Console</span>
                      </Link>
                    )}
                  </div>

                  <div className="border-t border-[var(--line)] pt-1">
                    <button
                      type="button"
                      onClick={async () => {
                        closeAllMenus();
                        try {
                          await logout().unwrap();
                          toast.success("Signed out");
                          navigate("/");
                        } catch {
                          navigate("/");
                        }
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-medium text-rose-500 transition hover:bg-rose-500/10 cursor-pointer"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <Link
                to="/login"
                className="rounded-full px-3 py-1.5 text-xs font-bold text-[var(--ink)] transition hover:bg-[var(--line)]/30"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="rounded-full bg-[var(--ink)] px-3.5 py-1.5 text-xs font-bold text-[var(--paper)] transition hover:opacity-90"
              >
                Join
              </Link>
            </div>
          )}

          {/* Mobile Navigation Toggle Button */}
          <button
            type="button"
            onClick={() => setShowMobileMenu((v) => !v)}
            className="md:hidden flex h-8 w-8 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] transition hover:bg-[var(--line)]/30 cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {showMobileMenu ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {showMobileMenu && (
        <div className="md:hidden border-t border-[var(--line)] bg-[var(--surface)] px-4 py-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-2 gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === location.pathname ||
                (item.href === "/deals" &&
                  (location.pathname === "/browse" ||
                    (location.pathname.startsWith("/deals/") &&
                      location.pathname !== "/deals/new"))) ||
                (item.href === "/deals/new" &&
                  (location.pathname === "/deals/new" ||
                    location.pathname === "/create-deal")) ||
                (item.href === "/my-deals" &&
                  location.pathname.startsWith("/my-deals")) ||
                (item.href === "/contracts" &&
                  location.pathname.startsWith("/contracts")) ||
                (item.href === "/settings" &&
                  location.pathname.startsWith("/settings")) ||
                (item.href === "/admin" &&
                  location.pathname.startsWith("/admin"));

              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={closeAllMenus}
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold transition",
                    isActive
                      ? "bg-[var(--ink)] text-[var(--paper)] shadow-xs"
                      : "bg-[var(--line)]/20 text-[var(--ink)] hover:bg-[var(--line)]/40"
                  )}
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[var(--line)]">
            <button
              type="button"
              onClick={() => {
                requestBrowserLocation();
                closeAllMenus();
              }}
              className="flex items-center gap-1.5 text-xs font-semibold text-[var(--ink)]"
            >
              <MapPin className="h-3.5 w-3.5 text-emerald-500" />
              <span>{userLocation.cityName || "Enable GPS Location"}</span>
            </button>
            <span className="text-xs text-[var(--muted)] font-medium">
              Radius: {radiusKm} km
            </span>
          </div>
        </div>
      )}
    </header>
  );
}

export default AppNavbar;
