"use client";

import { QueryProvider } from "./query-provider";
import { ThemeProvider } from "./theme-provider";
import { SessionProvider } from "./session-provider";
import { Toaster } from "sonner";

export function Providers({ children }) {
  return (
    <SessionProvider>
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
    </SessionProvider>
  );
}
