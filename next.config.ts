import type { NextConfig } from "next";

const pearlRpc = "https://rpc.pearl.testnets.gno.land";
function publicRpcOrigin() {
  try {
    const url = new URL(process.env.NEXT_PUBLIC_GNO_RPC_URL || pearlRpc);
    return url.protocol === "https:" && !url.username && !url.password
      ? url.origin
      : new URL(pearlRpc).origin;
  } catch {
    return new URL(pearlRpc).origin;
  }
}
const rpcOrigin = publicRpcOrigin();

const config: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  typedRoutes: false,
  async headers() {
    return [{ source: "/(.*)", headers: [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Origin-Agent-Cluster", value: "?1" },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=(), tools=(self)",
      },
      { key: "Content-Security-Policy", value: `default-src 'self'; script-src 'self' 'unsafe-inline'${process.env.NODE_ENV!=="production"?" 'unsafe-eval'":""}; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' ${rpcOrigin}; frame-ancestors 'none'; base-uri 'self'; form-action 'self'` }
    ] }];
  }
};
export default config;
