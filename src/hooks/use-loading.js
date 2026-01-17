"use client";

import { useState, useCallback } from "react";

export function useLoading(initialState = false) {
  const [isLoading, setIsLoading] = useState(initialState);

  const startLoading = useCallback(() => setIsLoading(true), []);
  const stopLoading = useCallback(() => setIsLoading(false), []);

  const withLoading = useCallback(
    async (asyncFn) => {
      try {
        setIsLoading(true);
        return await asyncFn();
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return { isLoading, startLoading, stopLoading, withLoading };
}
