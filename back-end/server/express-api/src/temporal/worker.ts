import "dotenv/config";
import { NativeConnection, Worker } from "@temporalio/worker";

async function run() {
  const connection = await NativeConnection.connect({
    address: process.env.TEMPORAL_ADDRESS ?? "localhost:7233",
  });
  const workflowsPath = require.resolve("./workflows/checkoutWorkflow");
  const worker = await Worker.create({
    connection,
    workflowsPath,
    activities: await import("./activities/checkoutActivities"),
    taskQueue: process.env.TEMPORAL_TASK_QUEUE ?? "checkout-task-queue",
    namespace: process.env.TEMPORAL_NAMESPACE ?? "default",
  });

  await worker.run();
}

run().catch((error) => {
  console.error("Temporal worker failed:", error);
  process.exit(1);
});
