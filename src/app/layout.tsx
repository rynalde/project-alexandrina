import type { Metadata, Viewport } from "next";
import { Rubik, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import MotionProvider from "@/components/layout/MotionProvider";

const rubik = Rubik({
  subsets: ["latin"],
  variable: "--font-rubik",
  style: ["normal", "italic"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Cadernos de Estudo — NLP & Deep Learning",
  description:
    "Guias interativos de NLP e Deep Learning com teoria, playgrounds e simulados.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="pt-BR"
      className={`dark ${rubik.variable} ${jetbrainsMono.variable} bg-background`}
    >
      <body className="font-sans text-foreground antialiased min-h-full">
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
