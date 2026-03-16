import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sahas Sharma",
  description: "Portfolio of Sahas Sharma — CS, AI, and Research",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
