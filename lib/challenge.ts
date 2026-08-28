import { PaymentRequirementsSchema, resourceHash, type PaymentRequirements } from "./domain.ts";
import { saveChallenge } from "./store.ts";

export type ChallengeOptions={payTo?:string;amount?:string;description?:string;merchantId?:string;agentId?:string;policyId?:string;quoteId?:string};
export async function createGnoChallenge(resource: string, method = "GET", options:ChallengeOptions={}): Promise<PaymentRequirements> {
  const selfTest=process.env.G402_SELF_TEST_MODE==="true";
  const payTo = selfTest&&options.payTo?options.payTo:process.env.G402_MERCHANT_ADDRESS;
  const paymentMode=process.env.G402_PAYMENT_MODE==="realm"?"realm":"direct";
  const contractPath=process.env.G402_CONTRACT_PATH;
  if (!payTo) throw new Error("merchant_address_required");
  if(paymentMode==="realm"&&!contractPath)throw new Error("contract_path_required");
  const requirements=PaymentRequirementsSchema.parse({scheme:"exact",network:process.env.GNO_NETWORK_ID||"gno:pearl-1",asset:paymentMode==="realm"?(process.env.GNO_DENOM||"ugnot"):(process.env.GNO_ASSET||"gno.land/r/gnoland/wugnot"),amount:options.amount||process.env.G402_SAMPLE_PRICE||"1000",payTo,maxTimeoutSeconds:300,resource,description:options.description||"g402 Pearl paid API request",mimeType:"application/json",extra:{chainId:process.env.GNO_CHAIN_ID||"pearl-1",denom:process.env.GNO_DENOM||"ugnot",resourceHash:resourceHash(method,resource),expiresAt:Math.floor(Date.now()/1000)+300,nonce:crypto.randomUUID().replaceAll("-",""),paymentMode,contractPath:paymentMode==="realm"?contractPath:undefined,merchantId:options.merchantId,agentId:options.agentId,policyId:options.policyId,quoteId:options.quoteId}});
  await saveChallenge({nonce:requirements.extra.nonce,resource:requirements.resource,resourceHash:requirements.extra.resourceHash,method:method.toUpperCase(),network:requirements.network,chainId:requirements.extra.chainId,asset:requirements.asset,denom:requirements.extra.denom,amount:requirements.amount,payTo:requirements.payTo,paymentMode:requirements.extra.paymentMode||"direct",contractPath:requirements.extra.contractPath,merchantId:requirements.extra.merchantId,agentId:requirements.extra.agentId,policyId:requirements.extra.policyId,quoteId:requirements.extra.quoteId,expiresAt:requirements.extra.expiresAt,createdAt:new Date().toISOString()});
  return requirements;
}
export function paymentRequiredHeader(requirements: PaymentRequirements){return Buffer.from(JSON.stringify({x402Version:2,accepts:[requirements]})).toString("base64url")}
