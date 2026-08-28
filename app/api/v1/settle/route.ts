import { NextRequest,NextResponse } from "next/server";
import { assertSettlementAllowed,paymentFingerprint,PaymentPayloadSchema,PaymentRequirementsSchema } from "@/lib/domain";
import { GnoRpcClient,signedTransactionHash,verifyGnoPayment } from "@/lib/gno";
import { authorize,rateLimit,safeError } from "@/lib/http";
import { appendAudit,claimSettlement,resumeApprovedSettlement,savePayment,validateIssuedChallenge } from "@/lib/store";
import { enforceAgentPolicy } from "@/lib/payment-policy";
import { alertOps,metrics } from "@/lib/observability";

export async function POST(req:NextRequest){
  const started=Date.now(),limited=await rateLimit(req,30);if(limited)return limited;
  if(!authorize(req))return safeError("unauthorized",401);
  try{
    const body=await req.json(),payload=PaymentPayloadSchema.parse(body.paymentPayload),requirements=PaymentRequirementsSchema.parse(body.paymentRequirements),paymentId=payload.payload.paymentId;
    assertSettlementAllowed(payload.network,requirements.extra.chainId);
    await validateIssuedChallenge(requirements);
    const verified=verifyGnoPayment(payload,requirements);if(!verified.isValid){metrics.inc("g402_verify_failures",{reason:verified.invalidReason||"unknown"});return NextResponse.json({success:false,network:payload.network,errorReason:verified.invalidReason},{status:400})}
    const fingerprint=paymentFingerprint(payload,requirements),decision=await enforceAgentPolicy(requirements,paymentId);
    const txHash=signedTransactionHash(payload.payload.signedTx),record={id:crypto.randomUUID(),paymentId,fingerprint,nonce:requirements.extra.nonce,txHash,network:payload.network,payer:payload.payload.payer,payTo:requirements.payTo,asset:requirements.asset,amount:requirements.amount,status:(decision.reason==="approval_required"?"approval_required":"settling") as "approval_required"|"settling",error:null,resourceHash:requirements.extra.resourceHash,source:"facilitator" as const,merchantId:requirements.extra.merchantId,agentId:requirements.extra.agentId,policyId:requirements.extra.policyId,serviceQuoteId:requirements.extra.quoteId,createdAt:new Date().toISOString()};
    if(!decision.allowed&&decision.reason!=="approval_required")return NextResponse.json({success:false,network:payload.network,errorReason:decision.reason},{status:403});
    const claim=await claimSettlement(record);
    if(decision.reason==="approval_required"){await appendAudit(payload.payload.payer,"payment.approval_requested",paymentId,{policyId:requirements.extra.policyId});return NextResponse.json({success:false,network:payload.network,errorReason:"approval_required",paymentId},{status:403})}
    if(!claim.claimed){const e=claim.existing;if(e?.status==="approval_required"&&await resumeApprovedSettlement(paymentId,fingerprint)){}else if(e?.status==="settled")return NextResponse.json({success:true,transaction:e.txHash,network:e.network,replayed:true,blockHeight:e.blockHeight},{status:200});else if(e?.status!=="settling"&&e?.status!=="broadcast")return NextResponse.json({success:false,transaction:e?.txHash,network:e?.network||payload.network,replayed:true,errorReason:e?.error||e?.status},{status:409})}
    await appendAudit(payload.payload.payer,"payment.settlement_claimed",paymentId,{network:payload.network,amount:requirements.amount});
    const rpc=new GnoRpcClient(),existingOnChain=await rpc.lookupTransaction(txHash,payload.network),result=existingOnChain||await rpc.broadcastTxCommit(payload.payload.signedTx,payload.network,requirements.extra.chainId),nextStatus=result.success?"settled":result.pending?"broadcast":"failed";
    await savePayment({...record,txHash:result.transaction||txHash,status:nextStatus,error:result.errorReason||null,blockHeight:result.blockHeight,confirmations:result.success?1:0,updatedAt:new Date().toISOString()});
    metrics.inc("g402_settlements",{network:payload.network,success:result.success});metrics.observe("g402_settlement_ms",Date.now()-started,{network:payload.network});
    if(!result.success)void alertOps("g402 settlement failed",{paymentId,reason:result.errorReason,network:payload.network});
    return NextResponse.json(result,{status:result.success?200:result.pending?202:502,headers:{"cache-control":"no-store"}})
  }catch(e){const m=e instanceof Error?e.message:"invalid_request";return safeError(m,m==="settlement_disabled"||m==="mainnet_locked"||m==="network_not_configured"?503:m==="nonce_reused"||m==="idempotency_conflict"?409:400)}
}
