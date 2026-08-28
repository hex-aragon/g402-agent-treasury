import { NextRequest,NextResponse } from "next/server";
import { authorize,safeError } from "@/lib/http";
import { metrics } from "@/lib/observability";
export const dynamic="force-dynamic";
export async function GET(req:NextRequest){if(!authorize(req))return safeError("unauthorized",401);return NextResponse.json(metrics.snapshot(),{headers:{"cache-control":"no-store"}})}
