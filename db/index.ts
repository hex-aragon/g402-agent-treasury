type SitesEnv = { DB?: D1Database };

export async function getD1(): Promise<D1Database | null> {
  try {
    const cloudflare = await import("cloudflare:workers") as { env: SitesEnv };
    return cloudflare.env.DB ?? null;
  } catch {
    return null;
  }
}

export async function requireD1(): Promise<D1Database> {
  const db = await getD1();
  if (!db) throw new Error("durable_database_unavailable");
  return db;
}
