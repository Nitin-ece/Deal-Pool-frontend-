import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { AppNavbar } from "./AppNavbar";
import { LocationPrompt } from "../map/LocationPrompt";
import { useAuth } from "../../hooks/useAuth";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { requestUserLocation } from "../../redux/slices/locationSlice";
import { setUserLocation } from "../../redux/slices/dealsSlice";

export function AppLayout() {
  const dispatch = useAppDispatch();
  const { checkAuth, initialized } = useAuth();
  const locationPermission = useAppSelector((state) => state.location.permission);

  useEffect(() => {
    if (!initialized) checkAuth();
  }, [checkAuth, initialized]);

  // Request browser location automatically on mount
  useEffect(() => {
    dispatch(requestUserLocation())
      .unwrap()
      .then((res) => dispatch(setUserLocation(res)))
      .catch(() => {});
  }, [dispatch]);

  return (
    <div className="flex min-h-dvh flex-col bg-[var(--paper)] text-[var(--ink)] antialiased transition-colors duration-200">
      <AppNavbar />
      <main className="flex-1 w-full">
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;
