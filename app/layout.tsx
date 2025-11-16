import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Memory Lane",
  description: "Take-home coding challenge for Planned software engineering role",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Toaster richColors position="top-right" />
        {children}
      </body>
    </html>
  );
}
