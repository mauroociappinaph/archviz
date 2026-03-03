import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "archviz — Architecture Visualizer",
  description: "Visualize your repository architecture automatically. Generate C4 diagrams from any GitHub repository in seconds.",
  keywords: ["architecture", "C4", "diagrams", "GitHub", "visualization", "documentation"],
  openGraph: {
    title: "archviz — Architecture Visualizer",
    description: "Visualize your repository architecture automatically",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable}`}>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
