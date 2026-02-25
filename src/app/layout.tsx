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

const siteUrl = "https://rabbi-silverstein.vercel.app";
const siteName = "Rabbi Odom Silverstein | Torah Shiurim";
const siteDescription =
  "Learn Torah with Rabbi Odom Silverstein. 5 Minute Nefesh HaChaim, 5 Minute Tanya, Bitachon, Parsha, and more. Clear and concise shiurim for daily growth.";

export const metadata: Metadata = {
  title: {
    default: siteName,
    template: "%s | Rabbi Odom Silverstein",
  },
  description: siteDescription,
  keywords: [
    "Rabbi Odom Silverstein",
    "Rabbi Silverstein",
    "Nefesh HaChaim",
    "Tanya",
    "Bitachon",
    "Parsha",
    "Torah shiurim",
    "Jewish podcasts",
    "Torah lectures",
    "daily Torah",
    "Jewish learning",
    "Chassidus",
    "Mussar",
    "Torah audio",
    "shiur",
  ],
  metadataBase: new URL(siteUrl),
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName,
    title: siteName,
    description: siteDescription,
  },
  twitter: {
    card: "summary",
    title: siteName,
    description: siteDescription,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: siteName,
              url: siteUrl,
              description: siteDescription,
              publisher: {
                "@type": "Person",
                name: "Rabbi Odom Silverstein",
                jobTitle: "Torah Educator",
              },
              potentialAction: {
                "@type": "SearchAction",
                target: `${siteUrl}/shiurim/{search_term_string}`,
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
      </head>
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
