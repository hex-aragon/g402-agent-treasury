import { closePostgres, getPostgres } from "../db/postgres.ts";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");

const sql = getPostgres();
const batch = Math.min(
  10_000,
  Math.max(100, Number(process.env.MAINTENANCE_BATCH_SIZE || 5_000)),
);

try {
  const rate = await sql`
    delete from rate_limit_buckets
    where (key_hash, window_start) in (
      select key_hash, window_start
      from rate_limit_buckets
      where window_start < now() - interval '1 day'
      limit ${batch}
    )
    returning key_hash
  `;
  const quotes = await sql`
    update service_quotes
    set status = 'expired', updated_at = now()
    where id in (
      select id
      from service_quotes
      where status = 'offered' and expires_at < now()
      limit ${batch}
    )
    returning id
  `;
  const stuck = await sql`
    select id, quote_id
    from akash_requests
    where status = 'processing'
      and updated_at < now() - interval '15 minutes'
    limit ${batch}
  `;

  console.log(
    JSON.stringify({
      rateBucketsDeleted: rate.length,
      quotesExpired: quotes.length,
      stuckRequests: stuck.length,
      at: new Date().toISOString(),
    }),
  );
  if (stuck.length) process.exitCode = 2;
} finally {
  await closePostgres();
}
