import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "x402 Agent Gateways",
  description: "Pearl testnet x402 facilitator and persistent Gno.land scan"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="ko"><head><meta name="gnoconnect:rpc" content={process.env.GNO_RPC_URL||"https://rpc.pearl.testnets.gno.land"}/><meta name="gnoconnect:chainid" content={process.env.GNO_CHAIN_ID||"pearl-1"}/><meta name="gnoconnect:txdomains" content="auto"/></head><body>
    <header className="topbar"><Link href="/" className="brand"><span className="brandMark">g</span>402</Link>
      <nav><Link href="/scan">Scan</Link><Link href="/payments">Payments</Link><Link href="/wallet">Pay test</Link><Link href="/developers">Facilitator API</Link><Link href="/console">Operations</Link></nav>
      <div className="network"><span className="pulse"/>Pearl testnet</div>
    </header>
    <main>{children}</main>
    <footer><span>g402 facilitator + scan</span><span>Pearl testnet · Mainnet locked</span></footer>
  </body></html>;
}
