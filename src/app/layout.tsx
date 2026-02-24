import type { Metadata } from "next";
import { Inter, Playfair_Display, Frank_Ruhl_Libre } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import AuthProvider from "@/components/AuthProvider";
import { AudioPlayerProvider } from "@/components/shiurim/AudioPlayerProvider";
import AudioPlayerBar from "@/components/shiurim/AudioPlayerBar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
});

const frankRuhl = Frank_Ruhl_Libre({
  variable: "--font-hebrew",
  subsets: ["hebrew"],
  weight: ["300", "400", "700"],
});

export const metadata: Metadata = {
  title: "Rabbi Odom Silverstein | Torah Shiurim",
  description:
    "Learn Torah with Rabbi Odom Silverstein. 5 Minute Nefesh HaChaim, 5 Minute Tanya, Bitachon, Parsha, and more. Clear and concise shiurim for daily growth.",
  keywords: [
    "Rabbi Odom Silverstein",
    "Nefesh HaChaim",
    "Tanya",
    "Bitachon",
    "Parsha",
    "Torah shiurim",
    "Jewish podcasts",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} ${frankRuhl.variable} antialiased`}>
        <AuthProvider>
          <AudioPlayerProvider>
            <Navbar />
            {children}
            <Footer />
            <AudioPlayerBar />
          </AudioPlayerProvider>
          <Analytics />
        </AuthProvider>
      </body>
    </html>
  );
}
