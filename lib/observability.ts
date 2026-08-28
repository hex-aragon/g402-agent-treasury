type Labels=Record<string,string|number|boolean>;
const counters=new Map<string,number>();
const histograms=new Map<string,number[]>();
function key(name:string,labels:Labels={}){return `${name}{${Object.entries(labels).sort().map(([k,v])=>`${k}=${v}`).join(",")}}`}
export const metrics={
  inc(name:string,labels:Labels={},value=1){const k=key(name,labels);counters.set(k,(counters.get(k)||0)+value)},
  observe(name:string,value:number,labels:Labels={}){const k=key(name,labels);const a=histograms.get(k)||[];a.push(value);if(a.length>2000)a.shift();histograms.set(k,a)},
  snapshot(){return {counters:Object.fromEntries(counters),histograms:Object.fromEntries([...histograms].map(([k,v])=>[k,{count:v.length,sum:v.reduce((a,b)=>a+b,0),max:Math.max(0,...v)}]))}}
};
export function auditEvent(action:string,actor:string,target:string,metadata:Record<string,unknown>={}){console.log(JSON.stringify({level:"info",kind:"audit",action,actor,target,metadata,at:new Date().toISOString()}))}
export async function alertOps(summary:string,details:Record<string,unknown>={}){const url=process.env.ALERT_WEBHOOK_URL;if(!url){console.error(JSON.stringify({level:"error",kind:"alert",summary,details,at:new Date().toISOString()}));return}try{await fetch(url,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({summary,details,service:"g402",at:new Date().toISOString()}),signal:AbortSignal.timeout(5000)})}catch(e){console.error(JSON.stringify({level:"error",kind:"alert_delivery_failed",summary,message:e instanceof Error?e.message:String(e)}))}}
