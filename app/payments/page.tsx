import { PaymentTable } from "@/app/page";
import { listPayments } from "@/lib/store";
export const dynamic="force-dynamic";
export default async function Payments(){const payments=await listPayments(100);return <><div className="pageHead"><div className="eyebrow">Canonical ledger view</div><h1>Payment explorer</h1><p>Verified, broadcast, finalized and reverted states come from durable storage.</p></div><div className="card"><PaymentTable payments={payments}/></div></>}
