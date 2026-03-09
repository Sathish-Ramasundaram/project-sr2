import { Request, Response } from "express";
import { WorkflowFailedError, WorkflowNotFoundError } from "@temporalio/client";
import { toCheckoutAddress } from "./checkoutValidation";
import { getTemporalClient } from "../../temporal/client";
import type { CheckoutInput } from "../../temporal/activities/checkoutActivities";
import type { CheckoutWorkflowResult } from "../../temporal/workflows/checkoutWorkflow";

const TEMPORAL_TASK_QUEUE = process.env.TEMPORAL_TASK_QUEUE ?? "checkout-task-queue";

export async function placeOrderHandler(req: Request, res: Response) {
  const customerId =
    typeof (req.body as { customerId?: unknown } | undefined)?.customerId === "string"
      ? (req.body as { customerId: string }).customerId
      : "";
  const address = toCheckoutAddress((req.body as { address?: unknown } | undefined)?.address);

  if (!customerId || !address) {
    res.status(400).json({ message: "customerId and address are required." });
    return;
  }

  try {
    const client = await getTemporalClient();
    const workflowId = `checkout-${customerId}-${Date.now()}`;
    const input: CheckoutInput = { customerId, address };

    const handle = await client.workflow.start("checkoutWorkflow", {
      taskQueue: TEMPORAL_TASK_QUEUE,
      workflowId,
      args: [input]
    });

    res.status(202).json({
      message: "Checkout accepted. Payment is being processed.",
      workflowId: handle.workflowId,
      runId: handle.firstExecutionRunId,
      status: "RUNNING"
    });
  } catch (error) {
    res.status(500).json({
      message:
        error instanceof Error ? error.message : "Failed to start checkout workflow."
    });
  }
}

export async function getCheckoutStatusHandler(req: Request, res: Response) {
  const workflowIdParam = (req.params as { workflowId?: string | string[] }).workflowId;
  const workflowId =
    typeof workflowIdParam === "string" ? workflowIdParam.trim() : "";

  if (!workflowId) {
    res.status(400).json({ message: "workflowId is required." });
    return;
  }

  try {
    const client = await getTemporalClient();
    const handle = client.workflow.getHandle(workflowId);
    const result = (await Promise.race([
      handle.result(),
      new Promise<never>((_resolve, reject) => {
        setTimeout(() => reject(new Error("WORKFLOW_RUNNING")), 250);
      })
    ])) as CheckoutWorkflowResult;

    res.status(200).json({
      status: "COMPLETED",
      result
    });
  } catch (error) {
    if (error instanceof WorkflowNotFoundError) {
      res.status(404).json({ status: "NOT_FOUND", message: "Workflow not found." });
      return;
    }

    if (error instanceof WorkflowFailedError) {
      res.status(200).json({
        status: "FAILED",
        message: error.message
      });
      return;
    }

    if (error instanceof Error && error.message === "WORKFLOW_RUNNING") {
      res.status(200).json({ status: "RUNNING" });
      return;
    }

    res.status(500).json({
      status: "ERROR",
      message: error instanceof Error ? error.message : "Failed to get checkout status."
    });
  }
}
