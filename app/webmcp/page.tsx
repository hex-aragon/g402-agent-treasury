import WebMCPWorkbench from "./WebMCPWorkbench";

export default function WebMCPPage() {
  return <>
    <div className="pageHead webmcpHead">
      <div className="eyebrow">The agent-native payment desk</div>
      <h1>Agent prepares.<br/><em>Human approves.</em></h1>
      <p>WebMCP connects an AI agent to the live g402 facilitator, while Adena keeps the signing decision with the person. Every payment stays on Pearl testnet and Gno mainnet remains locked.</p>
    </div>
    <WebMCPWorkbench/>
  </>;
}
