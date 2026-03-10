import "dotenv/config";
import { checkKnexConnection, knexDb } from "../lib/knexClient";

async function run() {
  const result = await checkKnexConnection();
  const rows = Array.isArray((result as { rows?: unknown[] }).rows)
    ? (result as { rows: unknown[] }).rows
    : result;

  console.log("Knex Postgres connection ok.", rows);
  await knexDb.destroy();
}

run().catch(async (error) => {
  console.error("Knex Postgres connection failed:", error);
  await knexDb.destroy();
  process.exit(1);
});

