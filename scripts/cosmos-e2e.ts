export {};
const base=(process.env.COSMOS_STAGING_BASE_URL||process.env.STAGING_BASE_URL||"").replace(/\/$/,"");if(!base)throw new Error("COSMOS_STAGING_BASE_URL is required");
const response=await fetch(`${base}/api/cosmos/v1/chains`),body=await response.json() as {chains?:Array<{caip2:string;testnet:boolean}>};if(!response.ok||!body.chains?.length||body.chains.some(c=>!c.caip2.startsWith("cosmos:")||!c.testnet))throw new Error("unsafe_cosmos_registry");
console.log(JSON.stringify({ok:true,checks:["caip2_registry","testnet_only","mainnet_filtered"],chains:body.chains.map(c=>c.caip2)}));
