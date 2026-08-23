import type { Metadata } from "next";
import { Fraunces, Inter, IBM_Plex_Mono } from "next/font/google";
import { ThemeProvider } from "@/lib/context/ThemeContext";
import { AuthProvider } from "@/lib/context/AuthContext";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["opsz"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mistake — B2B Discrepancy & Financial Leakage Detection",
  description:
    "Mistake audits every PO, GRN, and supplier invoice at integer-paise accuracy — catching rate escalations, short shipments, and missed SLA penalties before payment release. Built for Indian manufacturers, distributors, and wholesalers.",
  openGraph: {
    title: "Mistake — B2B Discrepancy & Financial Leakage Detection",
    description:
      "Evidence-backed leakage detection at paise-exact accuracy for Indian manufacturers, distributors, and wholesalers.",
    type: "website",
    siteName: "Mistake",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mistake — B2B Discrepancy & Financial Leakage Detection",
    description:
      "Catch rate escalations, short shipments, and missed SLA penalties before payment release.",
  },
  icons: {
    icon: "/favicon.svg",
  },
};

const themeInitScript = `(function(){try{var t=localStorage.getItem("mistake_theme")||"dark";var d=t==="dark"||(t==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d);}catch(e){document.documentElement.classList.add("dark");}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fraunces.variable} ${inter.variable} ${ibmPlexMono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="antialiased font-sans bg-background text-foreground">
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
