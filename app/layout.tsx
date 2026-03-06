import type { Metadata } from "next";
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
  title: "Threat Intelligence Tarot",
  description:
    "Real threat intelligence. Impossible to scroll past. Draw a card to reveal an adversary profile drawn from MITRE ATT&CK.",
  openGraph: {
    title: "Threat Intelligence Tarot",
    description: "Real threat intelligence. Impossible to scroll past.",
    type: "website",
  },
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
