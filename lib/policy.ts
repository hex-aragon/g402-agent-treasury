import { z } from "zod";
import type { PaymentRequirements } from "./domain.ts";

export const AgentPolicySchema=z.object({
  id:z.string().uuid(),agentId:z.string().uuid(),enabled:z.boolean(),network:z.string(),
  allowedMerchants:z.array(z.string().uuid()).max(500),allowedRecipients:z.array(z.string()).max(500),
  allowedAssets:z.array(z.string()).max(100),maxPerPayment:z.string().regex(/^\d+$/),
  dailyBudget:z.string().regex(/^\d+$/),monthlyBudget:z.string().regex(/^\d+$/),
  approvalThreshold:z.string().regex(/^\d+$/),validFrom:z.string().datetime(),validUntil:z.string().datetime(),
  requireResourceBinding:z.boolean().default(true)
}).strict();
export type AgentPolicy=z.infer<typeof AgentPolicySchema>;
export type PolicyUsage={daily:string;monthly:string};
export type PolicyDecision={allowed:boolean;requiresApproval:boolean;reason?:string;policyId:string};

export function evaluatePolicy(policy:AgentPolicy,requirements:PaymentRequirements,usage:PolicyUsage,now=new Date()):PolicyDecision{
  const deny=(reason:string):PolicyDecision=>({allowed:false,requiresApproval:false,reason,policyId:policy.id});
  if(!policy.enabled)return deny("policy_disabled");
  if(now<new Date(policy.validFrom)||now>new Date(policy.validUntil))return deny("policy_outside_validity");
  if(policy.network!==requirements.network)return deny("network_not_allowed");
  if(!policy.allowedAssets.includes(requirements.asset))return deny("asset_not_allowed");
  if(!policy.allowedRecipients.includes(requirements.payTo))return deny("recipient_not_allowed");
  if(requirements.extra.merchantId&&policy.allowedMerchants.length&&!policy.allowedMerchants.includes(requirements.extra.merchantId))return deny("merchant_not_allowed");
  const amount=BigInt(requirements.amount);
  if(amount>BigInt(policy.maxPerPayment))return deny("per_payment_limit_exceeded");
  if(BigInt(usage.daily)+amount>BigInt(policy.dailyBudget))return deny("daily_budget_exceeded");
  if(BigInt(usage.monthly)+amount>BigInt(policy.monthlyBudget))return deny("monthly_budget_exceeded");
  if(policy.requireResourceBinding&&!/^[a-f0-9]{64}$/.test(requirements.extra.resourceHash))return deny("resource_not_bound");
  return {allowed:true,requiresApproval:amount>BigInt(policy.approvalThreshold),policyId:policy.id};
}
