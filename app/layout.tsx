import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import "./details.css";
import "./ethiopian-streams.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });

export const metadata: Metadata = {
  title: "AddisMovie — Discover What to Watch",
  description:
    "A premium movie and TV discovery experience with Ethiopian stories, official publisher streams, trailers and lawful provider availability.",
  metadataBase: new URL("https://addismovie.example"),
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${manrope.variable}`}>{children}</body>
    </html>
  );
}
