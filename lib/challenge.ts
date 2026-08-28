import { PaymentRequirementsSchema, resourceHash, type PaymentRequirements } from "./domain.ts";

export function createGnoChallenge(resource: string, method = "GET"): PaymentRequirements {
  const payTo = process.env.G402_MERCHANT_ADDRESS || `g1${"q".repeat(38)}`;
  const paymentMode=process.env.G402_PAYMENT_MODE==="realm"?"realm":"direct";
  const contractPath=process.env.G402_CONTRACT_PATH;
  if (process.env.NODE_ENV === "production" && !process.env.G402_MERCHANT_ADDRESS) throw new Error("merchant_address_required");
  if(paymentMode==="realm"&&!contractPath)throw new Error("contract_path_required");
  return PaymentRequirementsSchema.parse({scheme:"exact",network:process.env.GNO_NETWORK_ID||"gno:staging",asset:paymentMode==="realm"?(process.env.GNO_DENOM||"ugnot"):(process.env.GNO_ASSET||"gno.land/r/gnoland/wugnot"),amount:process.env.G402_SAMPLE_PRICE||"1000",payTo,maxTimeoutSeconds:300,resource,description:"g402 staging paid weather sample",mimeType:"application/json",extra:{chainId:process.env.GNO_CHAIN_ID||"staging",denom:process.env.GNO_DENOM||"ugnot",resourceHash:resourceHash(method,resource),expiresAt:Math.floor(Date.now()/1000)+300,nonce:crypto.randomUUID().replaceAll("-",""),paymentMode,contractPath:paymentMode==="realm"?contractPath:undefined}});
}
export function paymentRequiredHeader(requirements: PaymentRequirements){return Buffer.from(JSON.stringify({x402Version:2,accepts:[requirements]})).toString("base64url")}
