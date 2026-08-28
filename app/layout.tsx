import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "x402 Agent Gateways",
  description: "Production-grade x402 payment infrastructure and explorer for Gno.land"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="ko"><head><meta name="gnoconnect:rpc" content={process.env.GNO_RPC_URL||"https://rpc.staging.gno.land:443"}/><meta name="gnoconnect:chainid" content={process.env.GNO_CHAIN_ID||"staging"}/><meta name="gnoconnect:txdomains" content="auto"/></head><body>
    <header className="topbar"><Link href="/" className="brand"><span className="brandMark">g</span>402</Link>
      <nav><Link href="/payments">Payments</Link><Link href="/agents">Agents</Link><Link href="/akash">Akash</Link><Link href="/storage">Storage</Link><Link href="/cosmos">Cosmos</Link><Link href="/wallet">Wallet</Link><Link href="/developers">Developers</Link><Link href="/console">Console</Link></nav>
      <div className="network"><span className="pulse"/>Gno Staging</div>
    </header>
    <main>{children}</main>
    <footer><span>g402 protocol infrastructure</span><span>Staging · Mainnet settlement locked</span></footer>
  </body></html>;
}
