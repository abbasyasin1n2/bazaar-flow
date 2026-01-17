"use client";

import { useState, useEffect, useSyncExternalStore } from "react";

function getServerSnapshot() {
  return false;
}

export function useMediaQuery(query) {
  const subscribe = (callback) => {
    const media = window.matchMedia(query);
    media.addEventListener("change", callback);
    return () => media.removeEventListener("change", callback);
  };

  const getSnapshot = () => {
    return window.matchMedia(query).matches;
  };

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useIsMobile() {
  return useMediaQuery("(max-width: 768px)");
}

export function useIsTablet() {
  return useMediaQuery("(max-width: 1024px)");
}
