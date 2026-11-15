import type { Metadata, Viewport } from "next";
import { Gaegu, Geist, Geist_Mono } from "next/font/google";
import { SceneArrival } from "@/components/dream/scene-transitions";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const gaegu = Gaegu({ variable: "--font-gaegu", subsets: ["latin"], weight: ["400", "700"] });

export const metadata: Metadata = {
  title: {
    default: "Memory Archaeologist",
    template: "%s · Memory Archaeologist",
  },
  description:
    "A dreamy night-time journal for diving into old memories and seeing how they change.",
};

export const viewport: Viewport = {
  themeColor: "#161838",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${gaegu.variable} min-h-dvh font-sans antialiased`}
      >
        {children}
        <SceneArrival />
      </body>
    </html>
  );
}
