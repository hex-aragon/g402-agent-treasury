import { PaymentRequirementsSchema } from "../../../lib/domain.ts";
import { createGnoChallenge } from "../../../lib/challenge.ts";
import {
  canonicalHash,
  evaluateServiceBudget,
} from "../../x402-core/src/index.ts";
import type { ServiceQuote } from "../../akash/src/domain.ts";
import {
  authorizeQuote,
  claimRequest,
  completeRequest,
  createQuote,
  failRequest,
  getQuote,
  getServiceBudget,
  getServiceUsage,
} from "../../akash/src/store.ts";
import { G402SettlementAdapter } from "../../akash/src/settlement.ts";
import {
  FilecoinPayAdapter,
  IpfsAdapter,
  PaymentChannelAdapter,
} from "./adapters.ts";
import { rawCidV1, sha256Hex } from "./cid.ts";
import type { UploadMetadata } from "./domain.ts";
import { quoteRetrieval, quoteSearch, quoteStorage } from "./pricing.ts";
import {
  getMockContent,
  getObject,
  saveObject,
  saveReceipt,
  saveRetrievalReceipt,
  searchObjects,
} from "./store.ts";
async function policy(
  agentId: string | undefined,
  service: string,
  amount: string,
) {
  if (!agentId) return;
  const budget = await getServiceBudget(agentId, service);
  if (!budget) throw new Error("storage_agent_budget_missing");
  const decision = evaluateServiceBudget(
    budget,
    amount,
    await getServiceUsage(agentId, service),
  );
  if (!decision.allowed) throw new Error(decision.reason);
}
async function offer(
  service: ServiceQuote["service"],
  requestHash: string,
  amount: string,
  resource: string,
  agentId?: string,
  method = "POST",
) {
  await policy(agentId, service, amount);
  const quote: ServiceQuote = {
    id: crypto.randomUUID(),
    service,
    agentId,
    requestHash,
    amount,
    asset: process.env.GNO_ASSET || "gno.land/r/gnoland/wugnot",
    network: process.env.GNO_NETWORK_ID || "gno:pearl-1",
    providerId: "filecoin-pin",
    expiresAt: new Date(Date.now() + 10 * 60_000).toISOString(),
    status: "offered",
  };
  await createQuote(quote);
  const bound = `${resource}?quote=${quote.id}`,
    challenge = await createGnoChallenge(bound, method, {
      amount,
      description: `${service} quote ${quote.id}`,
      agentId,
      quoteId: quote.id,
    });
  return { quote, challenge };
}
export async function offerUpload(
  bytes: Uint8Array,
  metadata: UploadMetadata,
  resource: string,
  agentId?: string,
) {
  const cid = rawCidV1(bytes),
    sha256 = sha256Hex(bytes),
    price = quoteStorage(
      bytes.byteLength,
      metadata.retentionDays,
      metadata.replicas,
    ),
    requestHash = canonicalHash({
      cid,
      sha256,
      size: bytes.byteLength,
      metadata,
      agentId,
    });
  return {
    ...(await offer(
      "filecoin-storage",
      requestHash,
      price.paymentAmount,
      resource,
      agentId,
    )),
    cid,
    sha256,
    size: bytes.byteLength,
    estimate: price,
  };
}
export async function executeUpload(input: {
  bytes: Uint8Array;
  metadata: UploadMetadata;
  quoteId: string;
  paymentId: string;
  requestId: string;
  agentId?: string;
}) {
  const quote = await getQuote(input.quoteId),
    cid = rawCidV1(input.bytes),
    sha256 = sha256Hex(input.bytes);
  if (!quote || quote.service !== "filecoin-storage")
    throw new Error("quote_not_found");
  if (
    quote.requestHash !==
    canonicalHash({
      cid,
      sha256,
      size: input.bytes.byteLength,
      metadata: input.metadata,
      agentId: input.agentId,
    })
  )
    throw new Error("quote_request_mismatch");
  const paid = await new G402SettlementAdapter().verify(input.paymentId, {
    quoteId: quote.id,
    network: quote.network,
    asset: quote.asset,
    amount: quote.amount,
    payTo: process.env.G402_MERCHANT_ADDRESS || "",
    agentId: input.agentId,
  });
  if (!paid.valid) throw new Error(paid.reason);
  if (!(await authorizeQuote(quote.id, input.paymentId)))
    throw new Error("quote_already_used");
  const claim = await claimRequest(
    input.requestId,
    quote.id,
    input.agentId,
    "storage",
  );
  if (!claim.claimed) {
    if (claim.response) return claim.response;
    throw new Error("request_in_progress");
  }
  const objectId = crypto.randomUUID(),
    createdAt = new Date().toISOString(),
    expiresAt = new Date(
      Date.now() + input.metadata.retentionDays * 86400_000,
    ).toISOString();
  try {
    const ipfs = await new IpfsAdapter().put(input.bytes);
    await saveObject(
      {
        id: objectId,
        cid,
        sha256,
        sizeBytes: input.bytes.byteLength,
        filename: input.metadata.filename,
        contentType: input.metadata.contentType,
        tags: input.metadata.tags,
        ownerAgentId: input.agentId,
        retentionDays: input.metadata.retentionDays,
        replicas: input.metadata.replicas,
        status: "committing",
        ipfsProvider: ipfs.provider,
        expiresAt,
        createdAt,
      },
      process.env.FILECOIN_MOCK === "true" ? input.bytes : undefined,
    );
    await saveReceipt({
      objectId,
      quoteId: quote.id,
      kind: "ipfs_upload",
      provider: ipfs.provider,
      externalId: cid,
      status: "confirmed",
    });
    const commitment = await new FilecoinPayAdapter().commit({
        cid,
        size: input.bytes.byteLength,
        days: input.metadata.retentionDays,
        replicas: input.metadata.replicas,
      }),
      status = commitment.status === "confirmed" ? "active" : "committing";
    await saveObject({
      id: objectId,
      cid,
      sha256,
      sizeBytes: input.bytes.byteLength,
      filename: input.metadata.filename,
      contentType: input.metadata.contentType,
      tags: input.metadata.tags,
      ownerAgentId: input.agentId,
      retentionDays: input.metadata.retentionDays,
      replicas: input.metadata.replicas,
      status,
      ipfsProvider: ipfs.provider,
      datasetId: commitment.datasetId,
      pieceCid: commitment.pieceCid,
      railId: commitment.railId,
      proofStatus: commitment.status,
      expiresAt,
      createdAt,
    });
    await saveReceipt({
      objectId,
      quoteId: quote.id,
      kind: "filecoin_commitment",
      provider: commitment.provider,
      externalId: commitment.datasetId,
      status: commitment.status,
      txHash: commitment.txHash,
      metadata: { pieceCid: commitment.pieceCid, railId: commitment.railId },
    });
    const response = {
      id: objectId,
      cid,
      size: input.bytes.byteLength,
      status,
      dataset_id: commitment.datasetId,
      piece_cid: commitment.pieceCid,
      payment_rail_id: commitment.railId,
      expires_at: expiresAt,
    };
    await completeRequest(
      input.requestId,
      { ...quote, status: "authorized", paymentId: input.paymentId },
      commitment.provider,
      input.bytes.byteLength,
      0,
      quote.amount,
      response,
    );
    return response;
  } catch (e) {
    await failRequest(
      input.requestId,
      e instanceof Error ? e.message : String(e),
    );
    throw e;
  }
}
export async function offerRetrieval(
  cid: string,
  resource: string,
  agentId?: string,
) {
  const object = await getObject(cid);
  if (!object) throw new Error("cid_not_found");
  if (new Date(object.expiresAt) < new Date())
    throw new Error("storage_expired");
  const price = quoteRetrieval(object.sizeBytes);
  return {
    ...(await offer(
      "filecoin-retrieval",
      canonicalHash({ cid, agentId }),
      price.paymentAmount,
      resource,
      agentId,
      "GET",
    )),
    object,
    estimate: price,
  };
}
export async function executeRetrieval(input: {
  cid: string;
  quoteId: string;
  paymentId: string;
  requestId: string;
  agentId?: string;
}) {
  const quote = await getQuote(input.quoteId),
    object = await getObject(input.cid);
  if (!quote || quote.service !== "filecoin-retrieval" || !object)
    throw new Error("retrieval_not_found");
  if (
    quote.requestHash !==
    canonicalHash({ cid: input.cid, agentId: input.agentId })
  )
    throw new Error("quote_request_mismatch");
  const paid = await new G402SettlementAdapter().verify(input.paymentId, {
    quoteId: quote.id,
    network: quote.network,
    asset: quote.asset,
    amount: quote.amount,
    payTo: process.env.G402_MERCHANT_ADDRESS || "",
    agentId: input.agentId,
  });
  if (!paid.valid) throw new Error(paid.reason);
  if (!(await authorizeQuote(quote.id, input.paymentId)))
    throw new Error("quote_already_used");
  const claim = await claimRequest(
    input.requestId,
    quote.id,
    input.agentId,
    "retrieval",
  );
  if (!claim.claimed && !claim.response) throw new Error("request_in_progress");
  let bytes = getMockContent(input.cid),
    provider = "mock-ipfs";
  if (!bytes) {
    const response = await new IpfsAdapter().get(input.cid),
      buffer = new Uint8Array(await response.arrayBuffer());
    if (
      buffer.byteLength !== object.sizeBytes ||
      rawCidV1(buffer) !== input.cid
    )
      throw new Error("retrieval_integrity_failed");
    bytes = buffer;
    provider = new URL(process.env.IPFS_GATEWAY_URL!).host;
  }
  let channel: { channel?: string; voucherNonce?: number } | undefined;
  if (
    process.env.FILECOIN_ENABLE_PAYCH === "true" ||
    process.env.FILECOIN_MOCK === "true"
  )
    channel = await new PaymentChannelAdapter().reserve({
      from: process.env.FILECOIN_PAYCH_FROM || "t0100",
      to: process.env.FILECOIN_PAYCH_TO || "t0200",
      amount: quote.amount,
    });
  if (claim.claimed)
    await completeRequest(
      input.requestId,
      { ...quote, status: "authorized", paymentId: input.paymentId },
      provider,
      bytes.byteLength,
      0,
      quote.amount,
      { cid: input.cid, bytes: bytes.byteLength },
    );
  await saveRetrievalReceipt({
    cid: input.cid,
    quoteId: quote.id,
    agentId: input.agentId,
    bytes: bytes.byteLength,
    provider,
    channel: channel?.channel,
    voucherNonce: channel?.voucherNonce,
    requestId: input.requestId,
  });
  return { bytes, object, channel };
}
export async function offerSearch(
  request: { query: string; tags: string[]; limit: number },
  resource: string,
  agentId?: string,
) {
  const price = quoteSearch();
  return {
    ...(await offer(
      "filecoin-search",
      canonicalHash({ request, agentId }),
      price.paymentAmount,
      resource,
      agentId,
    )),
    estimate: price,
  };
}
export async function executeSearch(input: {
  request: { query: string; tags: string[]; limit: number };
  quoteId: string;
  paymentId: string;
  requestId: string;
  agentId?: string;
}) {
  const quote = await getQuote(input.quoteId);
  if (!quote || quote.service !== "filecoin-search")
    throw new Error("quote_not_found");
  if (
    quote.requestHash !==
    canonicalHash({ request: input.request, agentId: input.agentId })
  )
    throw new Error("quote_request_mismatch");
  const paid = await new G402SettlementAdapter().verify(input.paymentId, {
    quoteId: quote.id,
    network: quote.network,
    asset: quote.asset,
    amount: quote.amount,
    payTo: process.env.G402_MERCHANT_ADDRESS || "",
    agentId: input.agentId,
  });
  if (!paid.valid) throw new Error(paid.reason);
  if (!(await authorizeQuote(quote.id, input.paymentId)))
    throw new Error("quote_already_used");
  const claim = await claimRequest(
    input.requestId,
    quote.id,
    input.agentId,
    "search",
  );
  if (!claim.claimed) {
    if (claim.response) return claim.response;
    throw new Error("request_in_progress");
  }
  const results = (
    await searchObjects(
      input.request.query,
      input.request.tags,
      input.request.limit,
      input.agentId,
    )
  ).filter(Boolean);
  await completeRequest(
    input.requestId,
    { ...quote, status: "authorized", paymentId: input.paymentId },
    "storage-index",
    1,
    results.length,
    quote.amount,
    { results },
  );
  return { results };
}
