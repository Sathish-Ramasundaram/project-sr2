import knex, { Knex } from "knex";

function resolveDatabaseUrl() {
  if (process.env.KNEX_DATABASE_URL) {
    return process.env.KNEX_DATABASE_URL;
  }

  if (process.env.HASURA_GRAPHQL_DATABASE_URL) {
    return process.env.HASURA_GRAPHQL_DATABASE_URL;
  }

  const user = process.env.PGUSER ?? "postgres";
  const password = process.env.PGPASSWORD ?? "postgres";
  const host = process.env.PGHOST ?? "localhost";
  const port = Number(process.env.PGPORT ?? "5433");
  const database = process.env.PGDATABASE ?? "sr_store";
  return `postgres://${user}:${password}@${host}:${port}/${database}`;
}

export const knexDb: Knex = knex({
  client: "pg",
  connection: resolveDatabaseUrl(),
  pool: {
    min: 0,
    max: 10
  }
});

export async function checkKnexConnection() {
  const rows = await knexDb.raw("select current_database() as database_name");
  return rows;
}
