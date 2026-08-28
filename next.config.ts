import type { NextConfig } from "next";

const rpcOrigin = new URL(process.env.GNO_RPC_URL || "https://rpc.pearl.testnets.gno.land").origin;

const config: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  typedRoutes: false,
  async headers() {
    return [{ source: "/(.*)", headers: [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      { key: "Content-Security-Policy", value: `default-src 'self'; script-src 'self' 'unsafe-inline'${process.env.NODE_ENV!=="production"?" 'unsafe-eval'":""}; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' ${rpcOrigin}; frame-ancestors 'none'; base-uri 'self'; form-action 'self'` }
    ] }];
  }
};
export default config;
