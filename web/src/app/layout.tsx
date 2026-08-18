import type { Metadata } from "next";
import { ThemeProvider } from "@/lib/context/ThemeContext";
import { AuthProvider } from "@/lib/context/AuthContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mistake — B2B Discrepancy & Financial Leakage Detection",
  description:
    "Evidence-backed B2B discrepancy and financial leakage detection platform for manufacturers, distributors, and wholesalers.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased font-sans">
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
