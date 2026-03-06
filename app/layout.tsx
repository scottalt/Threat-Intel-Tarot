import type { Metadata, Viewport } from "next";
import { Cinzel, EB_Garamond } from "next/font/google";
import "./globals.css";

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  weight: ["400", "600", "700"],
});

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  variable: "--font-garamond",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://tarot.scottaltiparmak.com"),
  title: {
    default: "Threat Intelligence Tarot",
    template: "%s | Threat Intelligence Tarot",
  },
  description:
    "78 real adversary profiles from MITRE ATT&CK, presented as a tarot card deck. Draw a card to reveal TTPs, targets, and defenses for APT groups worldwide.",
  keywords: [
    "threat intelligence",
    "APT",
    "MITRE ATT&CK",
    "cybersecurity",
    "threat actors",
    "tarot",
    "CTI",
    "red team",
    "blue team",
    "incident response",
    "APT28",
    "Lazarus Group",
    "ransomware",
  ],
  openGraph: {
    title: "Threat Intelligence Tarot",
    description: "Real threat intelligence. Impossible to scroll past. 78 adversary profiles from MITRE ATT&CK.",
    type: "website",
    url: "https://tarot.scottaltiparmak.com",
    siteName: "Threat Intelligence Tarot",
  },
  twitter: {
    card: "summary_large_image",
    title: "Threat Intelligence Tarot",
    description: "Real threat intelligence. Impossible to scroll past. 78 MITRE ATT&CK adversary profiles.",
    creator: "@scottalt",
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "TI Tarot",
  },
};

export const viewport: Viewport = {
  themeColor: "#c9a84c",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${cinzel.variable} ${ebGaramond.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
