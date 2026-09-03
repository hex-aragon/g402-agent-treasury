import ScanClient from "./ScanClient";
import {
  getScanStatus,
  listScanBlocks,
  listScanTransactions,
} from "@/lib/scan";

export const dynamic = "force-dynamic";

export default async function Scan() {
  const indexerMode =
    process.env.INDEXER_MODE === "scheduled" ? "scheduled" : "persistent";
  const [status, blocks, transactions] = await Promise.all([
    getScanStatus(),
    listScanBlocks(20),
    listScanTransactions(50),
  ]);

  return (
    <>
      <div className="pageHead">
        <div className="eyebrow">Gno.land Pearl explorer</div>
        <h1>g402 Scan</h1>
        <p>
          관리형 인덱서가 기록한 블록, 트랜잭션, 주소와 g402 결제 영수증을
          읽기 전용으로 검색합니다.
        </p>
      </div>
      <ScanClient initial={{ status, blocks, transactions }} indexerMode={indexerMode} />
    </>
  );
}
