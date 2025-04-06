// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import Privy from "@/components/providers/privy";
import MiniKitProvider from "@/components/providers/miniket";

export const metadata: Metadata = {
  title: "BENS",
  description: "Business ENS",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <MiniKitProvider>
          <Privy>
            <div>{children}</div>
          </Privy>
        </MiniKitProvider>
      </body>
    </html>
  );
}
