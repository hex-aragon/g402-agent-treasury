import ScanClient from "./ScanClient";
import { getScanStatus,listScanBlocks,listScanTransactions,syncGnoIndex } from "@/lib/scan";
export const dynamic="force-dynamic";
export default async function Scan(){let status=await getScanStatus();if(status.indexedHeight===0){try{await syncGnoIndex({maxBlocks:8,bootstrapDepth:8})}catch{/* The live error remains visible in Scan status and health. */}status=await getScanStatus()}const [blocks,transactions]=await Promise.all([listScanBlocks(20),listScanTransactions(50)]);return <><div className="pageHead"><div className="eyebrow">Gno.land Pearl explorer</div><h1>g402 Scan</h1><p>블록, 트랜잭션, 주소와 g402 결제 영수증을 하나의 영속 원장에서 검색합니다.</p></div><ScanClient initial={{status,blocks,transactions}}/></>}
