import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PT Menara Terus Makmur - Peta Interaktif Pabrik",
  description: "Sistem Informasi Tata Letak, Denah Digital, dan Pemantauan Mesin PT Menara Terus Makmur",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Google+Sans:ital,opsz,wght@0,17..18,400..700;1,17..18,400..700&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
