import type { Metadata } from "next";
import type { ReactNode } from "react";

import { ThemeProvider } from "@/components/theme/theme-provider";
import "@/app/globals.css";
import "@/styles/tokens.css";
import "@/styles/shell.css";

export const metadata: Metadata = {
  title: {
    template: "newGL - %s",
    default: "newGL"
  },
  description: "The GL of accountants, by accountants, for accountants.",
  // The tab icon is the logo itself, one file for both (images are SVG only).
  icons: { icon: { url: "/logo.svg", type: "image/svg+xml" } }
};

type RootLayoutProperties = Readonly<{
  children: ReactNode;
}>;

// The html and body, and theming, shared by the signed-in pages (the (app)
// group, inside the app shell) and the sign-in page (outside it).
export default function RootLayout({ children }: RootLayoutProperties) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
