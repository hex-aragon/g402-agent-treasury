export {};
const base=(process.env.FILECOIN_STAGING_BASE_URL||process.env.STAGING_BASE_URL||"").replace(/\/$/,"");if(!base)throw new Error("FILECOIN_STAGING_BASE_URL is required");
const bytes=new TextEncoder().encode("filecoin staging probe"),response=await fetch(`${base}/api/storage/v1/upload?retentionDays=7&replicas=1`,{method:"POST",headers:{"content-type":"application/octet-stream","x-filename":"probe.txt","x-tags":"probe,e2e"},body:bytes}),body=await response.json() as {quote?:{id?:string};paymentRequirements?:{extra?:{quoteId?:string}};cid?:string};
if(response.status!==402||!response.headers.get("payment-required")||body.quote?.id!==body.paymentRequirements?.extra?.quoteId||!body.cid)throw new Error("filecoin_upload_quote_failed");
console.log(JSON.stringify({ok:true,checks:["upload_quote","cid","quote_binding","mainnet_lock_external"],cid:body.cid,quoteId:body.quote?.id}));
