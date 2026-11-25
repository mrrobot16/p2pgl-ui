"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ReactNode } from "react";

import { SYSTEM_THEME, THEME_NAMES } from "@/components/theme/themes";

/** Light or dark, following the operating system until the person picks one. */
export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme={SYSTEM_THEME} enableSystem themes={THEME_NAMES}>
      {children}
    </NextThemesProvider>
  );
}
