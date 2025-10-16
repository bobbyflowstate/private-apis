import type { Metadata } from "next";
import { AppProviders } from "@/providers/app-providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Private APIs Companion",
  description: "Securely run and manage your personal API workflows from anywhere.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Private APIs",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [
      // Favicon (PNG)
      { url: "/logo.png", type: "image/png", sizes: "any" },
      { url: "/icons/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icons/icon-512.png", type: "image/png", sizes: "512x512" }
    ],
    // iOS home screen icon relies on apple-touch-icon; prefer 180x180
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }
    ],
    shortcut: "/logo.png",
  },
};

export const viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen w-full max-w-full overflow-x-hidden">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
