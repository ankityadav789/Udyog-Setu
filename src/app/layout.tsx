import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import LayoutWrapper from "@/components/LayoutWrapper";
import { StoreProvider } from "@/context/StoreContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "UdyogSetu",
  description: "A comprehensive platform for Indian MSMEs to manage billing and sales.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <StoreProvider>
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
        </StoreProvider>
      </body>
    </html>
  );
}
