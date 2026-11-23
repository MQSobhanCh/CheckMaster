import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import { App as CapacitorApp } from "@capacitor/app";

// pages where "back" should leave the app (there is nothing before them)
const ROOT_PATHS = ["/", "/dashboard"];

// Phone's back button:
//  - inside a tab / sub page  -> go back one step (previous tab or page)
//  - on the home tab          -> close the app
export default function useAndroidBackButton() {
  const navigate = useNavigate();
  const location = useLocation();

  // keep the latest values in refs so the native listener is registered only once
  const navigateRef = useRef(navigate);
  const pathRef = useRef(location.pathname);

  navigateRef.current = navigate;
  pathRef.current = location.pathname;

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return undefined;

    let handle = null;
    let cancelled = false;

    CapacitorApp.addListener("backButton", () => {
      if (ROOT_PATHS.includes(pathRef.current)) {
        CapacitorApp.exitApp();
        return;
      }

      const hasHistory = window.history.state && window.history.state.idx > 0;

      if (hasHistory) {
        navigateRef.current(-1);
      } else {
        navigateRef.current("/dashboard", { replace: true });
      }
    }).then((listener) => {
      if (cancelled) {
        listener.remove();
      } else {
        handle = listener;
      }
    });

    return () => {
      cancelled = true;
      if (handle) handle.remove();
    };
  }, []);
}
