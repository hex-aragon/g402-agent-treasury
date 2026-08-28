export {};
const base=(process.env.AKASH_STAGING_BASE_URL||process.env.STAGING_BASE_URL||"").replace(/\/$/,"");if(!base)throw new Error("AKASH_STAGING_BASE_URL is required");
const models=await fetch(`${base}/api/akash/v1/models`),modelBody=await models.json() as {data?:Array<{id:string}>};if(!models.ok||!modelBody.data?.[0])throw new Error("akash_models_unavailable");
const chat=await fetch(`${base}/api/akash/v1/chat/completions`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({model:modelBody.data[0].id,messages:[{role:"user",content:"staging probe"}],max_tokens:8})}),body=await chat.json() as {quote?:{id?:string};paymentRequirements?:{extra?:{quoteId?:string}}};
if(chat.status!==402||!chat.headers.get("payment-required")||body.quote?.id!==body.paymentRequirements?.extra?.quoteId)throw new Error("akash_quote_binding_failed");
console.log(JSON.stringify({ok:true,checks:["models","x402_quote","quote_binding","mainnet_lock_external"],quoteId:body.quote?.id}));
