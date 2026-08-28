import { NextResponse } from "next/server";
export async function GET(){return NextResponse.json({kinds:[{x402Version:2,scheme:"exact",network:process.env.GNO_NETWORK_ID||"gno:staging",assets:[process.env.GNO_ASSET||"gno.land/r/gnoland/wugnot"],extra:{chainId:process.env.GNO_CHAIN_ID||"staging",gasSponsored:false}}]},{headers:{"cache-control":"public, max-age=60"}})}
