import type { Metadata } from "next";
import { Space_Mono } from "next/font/google";
import "./globals.css";

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-space-mono",
});

export const metadata: Metadata = {
  title: "archviz - Architecture Visualizer",
  description: "Visualize your repository architecture automatically. Generate C4 diagrams from any GitHub repository in seconds.",
  keywords: ["architecture", "C4", "diagrams", "GitHub", "visualization", "documentation"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${spaceMono.variable} font-mono antialiased`}>
        {children}
      </body>
    </html>
  );
}
