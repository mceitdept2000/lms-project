import "~/styles/globals.css";

import { type Metadata } from "next";
import { Inter } from "next/font/google";

import { MobileTabBar } from "~/app/_components/mobile-tab-bar";
import { SiteHeader } from "~/app/_components/site-header";
import { TRPCReactProvider } from "~/trpc/react";

export const metadata: Metadata = {
  title: "MCE LMS",
  description: "MCE Notes and question paper repository",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body>
        <TRPCReactProvider>
          <SiteHeader />
          <div className="pb-16 md:pb-0">{children}</div>
          <MobileTabBar />
        </TRPCReactProvider>
      </body>
    </html>
  );
}
