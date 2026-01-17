"use client";

import { QueryProvider } from "./query-provider";
import { ThemeProvider } from "./theme-provider";
import { Toaster } from "sonner";

export function Providers({ children }) {
  return (
    <QueryProvider>
      <ThemeProvider>
        {children}
        <Toaster 
          position="top-right" 
          richColors 
          closeButton
          duration={4000}
        />
      </ThemeProvider>
    </QueryProvider>
  );
}
