import { Connection, Client } from "@temporalio/client";

let clientInstance: Client | null = null;

export async function getTemporalClient() {
  if (clientInstance) {
    return clientInstance;
  }

  const address = process.env.TEMPORAL_ADDRESS ?? "localhost:7233";
  const connection = await Connection.connect({ address });

  clientInstance = new Client({
    connection,
    namespace: process.env.TEMPORAL_NAMESPACE ?? "default",
  });

  return clientInstance;
}
