import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pathway to College",
  description: "AI-powered college planning for students in grades 6–12.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
