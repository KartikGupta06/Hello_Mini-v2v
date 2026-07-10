import type { Metadata } from "next";
import "../styles/globals.css";
import { DevModeBadge } from "@/components/ui";

export const metadata: Metadata = {
  title: "SafeRoute AI | Premium Safety Companion",
  description: "Navigate with confidence. SafeRoute AI computes paths based on real-time crowdsourced reports, historical safety metrics, and AI risk analysis.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <DevModeBadge />
      </body>
    </html>
  );
}
