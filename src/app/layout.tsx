import type { Metadata } from "next";
import "../styles/globals.css";
import { DevModeBadge } from "@/components/ui";
import { EmergencyProvider } from "@/contexts/EmergencyContext";

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
        <EmergencyProvider>
          {children}
          <DevModeBadge />
        </EmergencyProvider>
      </body>
    </html>
  );
}
