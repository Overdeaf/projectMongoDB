import type { Metadata } from "next";
import { Inter } from "next/font/google";

export const metadata: Metadata = {
  title: "Task Checker",
  description: "Generated by create next app",
};

const inter = Inter({subsets: ["latin"]});


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        style={{padding: 0, margin: 0, backgroundColor: "white"}}
        className={inter.className}
      >
        {children}
      </body>
    </html>
  );
}
