import WebMCPWorkbench from "./WebMCPWorkbench";

export default function WebMCPPage() {
  return (
    <>
      <div className="pageHead webmcpHead">
        <div className="eyebrow">The agent-native payment desk</div>
        <h1>
          Agent prepares.
          <br />
          <em>Human approves.</em>
        </h1>
        <p>
          WebMCP lets an agent inspect and prepare EVM, Solana, or Gno payments
          while the connected wallet keeps the signing decision with the person.
          Every mainnet remains independently locked.
        </p>
      </div>
      <WebMCPWorkbench />
    </>
  );
}
