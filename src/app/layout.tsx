import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "セルマネ",
  description: "学校生活の予定を、ひとつの場所に。",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
