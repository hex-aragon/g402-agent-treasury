import postgres from "postgres";

type PostgresClient = ReturnType<typeof postgres>;

let client: PostgresClient | null = null;

function poolSize() {
  const configured = Number(process.env.DATABASE_POOL_MAX || "5");
  return Number.isFinite(configured)
    ? Math.min(20, Math.max(1, configured))
    : 5;
}

export function getPostgres(_connectionUrl?: string): PostgresClient {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) throw new Error("DATABASE_URL is required");

  if (!client) {
    client = postgres(url, {
      max: poolSize(),
      connect_timeout: 10,
      idle_timeout: 20,
      max_lifetime: 60 * 30,
      onnotice: () => undefined,
    });
  }

  return client;
}

export async function pingPostgres(): Promise<boolean> {
  const rows = await getPostgres()`select 1 as ok`;
  return Number(rows[0]?.ok) === 1;
}

export async function closePostgres(): Promise<void> {
  if (!client) return;
  const active = client;
  client = null;
  await active.end({ timeout: 5 });
}
