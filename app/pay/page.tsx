import MultichainPayClient from "./MultichainPayClient";

export default function MultichainPayPage() {
  return (
    <>
      <div className="pageHead multichainHead">
        <div className="eyebrow">CHAIN-NEUTRAL HUMAN APPROVAL</div>
        <h1>One payment desk. Three rails.</h1>
        <p>
          에이전트는 조건을 준비할 뿐입니다. EVM·Solana·Gno 지갑은 사람이
          네트워크, 자산, 금액, 수취인을 확인한 뒤 직접 서명합니다.
        </p>
      </div>
      <MultichainPayClient />
    </>
  );
}
