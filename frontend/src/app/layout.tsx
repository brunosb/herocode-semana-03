import type { Metadata } from "next";
import { Rubik } from "next/font/google";
import "./globals.css";
import { SocketProvider } from "@/context/SocketContext";

const rubik = Rubik({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Talk to Me!",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${rubik.className} bg-black text-white`}>
        <SocketProvider>{children}</SocketProvider>
      </body>
    </html>
  );
}
