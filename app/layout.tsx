import type { Metadata } from "next";
import Link from "next/link";
import WebMCPProvider from "./WebMCPProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "x402 Agent Treasury",
  description: "Human-approved WebMCP payments across EVM, Solana, and Gno",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <meta
          name="gnoconnect:rpc"
          content={
            process.env.GNO_RPC_URL || "https://rpc.pearl.testnets.gno.land"
          }
        />
        <meta
          name="gnoconnect:chainid"
          content={process.env.GNO_CHAIN_ID || "pearl-1"}
        />
        <meta name="gnoconnect:txdomains" content="auto" />
      </head>
      <body>
        <WebMCPProvider />
        <header className="topbar">
          <Link href="/" className="brand">
            <span className="brandMark">x</span>402
          </Link>
          <nav>
            <Link href="/webmcp">WebMCP</Link>
            <Link href="/pay">Multichain Pay</Link>
            <Link href="/scan">Gno Scan</Link>
            <Link href="/payments">Payments</Link>
            <Link href="/developers">API</Link>
            <Link href="/console">Operations</Link>
          </nav>
          <div className="network">
            <span className="pulse" />3 testnet rails
          </div>
        </header>
        <main>{children}</main>
        <footer>
          <span>x402 Agent Treasury · WebMCP</span>
          <span>EVM · Solana · Gno · Mainnets locked</span>
        </footer>
      </body>
    </html>
  );
}
