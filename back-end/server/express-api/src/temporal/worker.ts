import "dotenv/config";
import { Worker } from "@temporalio/worker";
import path from "path";

async function run() {
  const worker = await Worker.create({
    workflowsPath: path.join(__dirname, "workflows", "checkoutWorkflow.ts"),
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
