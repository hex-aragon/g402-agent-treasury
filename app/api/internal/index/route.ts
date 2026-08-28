import { NextRequest,NextResponse } from "next/server";
import { constantTimeApiKeyMatch } from "@/lib/domain";
export async function GET(req:NextRequest){const secret=process.env.INDEXER_SECRET||"",auth=req.headers.get("authorization")?.replace(/^Bearer\s+/i,"")||"";const cron=req.headers.get("x-vercel-cron")==="1";if(!cron&&(!secret||!auth||!constantTimeApiKeyMatch(auth,[secret])))return NextResponse.json({error:"unauthorized"},{status:401});return NextResponse.json({accepted:true,mode:"bounded-catchup",note:"Use the container worker for continuous production indexing."})}
