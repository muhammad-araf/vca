import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vocalink — AI Voice Employees For Modern Businesses",
  description:
    "Deploy realistic AI voice agents on your website in minutes. Handle customer conversations 24/7, automatically. From hello to handled.",
  keywords: ["AI voice agent", "voice AI", "customer service automation", "Gemini AI", "Pakistan SME"],
  openGraph: {
    title: "Vocalink — AI Voice Employees",
    description: "From hello to handled.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Inter+Tight:wght@700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-white text-slate-900 font-sans">{children}</body>
    </html>
  );
}
