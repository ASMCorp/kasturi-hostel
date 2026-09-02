import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kasturi Girls Hostel — Management System",
  description: "Kasturi Girls Hostel management system",
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
