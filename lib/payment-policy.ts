import type { PaymentRequirements } from "./domain.ts";
import { evaluatePolicy } from "./policy.ts";
import { getAgentPolicy,getPolicyUsage,hasApproval } from "./store.ts";

export async function enforceAgentPolicy(requirements:PaymentRequirements,paymentId:string){
  const agentId=requirements.extra.agentId;
  if(!agentId)return {allowed:true,requiresApproval:false};
  const policy=await getAgentPolicy(agentId);
  if(!policy)return {allowed:false,requiresApproval:false,reason:"agent_policy_missing"};
  if(requirements.extra.policyId&&requirements.extra.policyId!==policy.id)return {allowed:false,requiresApproval:false,reason:"policy_id_mismatch"};
  const decision=evaluatePolicy(policy,requirements,await getPolicyUsage(agentId));
  if(!decision.allowed)return decision;
  if(decision.requiresApproval&&!await hasApproval(paymentId))return {...decision,allowed:false,reason:"approval_required"};
  return decision;
}
