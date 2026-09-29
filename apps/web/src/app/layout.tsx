import type { Metadata } from "next";
import { Manrope, Outfit, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "Ravus — Turn your website into booked customers",
  description:
    "An approval-first AI marketing workspace for campaigns, lead conversations, bookings, and attribution.",
};

const manrope = Manrope({ subsets: ["latin"], variable: "--font-body", display: "swap" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const playfair = Playfair_Display({ subsets: ["latin"], style: "italic", weight: "400", variable: "--font-editorial", display: "swap" });

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${manrope.variable} ${outfit.variable} ${playfair.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
