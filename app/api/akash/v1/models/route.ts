import {NextResponse} from "next/server";
import {configuredProviders} from "@/packages/akash/src/routing";
export async function GET(){const models=[...new Set(configuredProviders().flatMap(p=>p.models))];return NextResponse.json({object:"list",data:models.map(id=>({id,object:"model",owned_by:"akash"}))},{headers:{"cache-control":"public, max-age=60"}})}
