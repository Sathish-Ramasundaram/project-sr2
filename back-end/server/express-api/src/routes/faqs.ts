import { Router } from "express";
import { addFaqItem, getFaqItems } from "../data/faqs";

const faqsRouter = Router();

faqsRouter.get("/", (_req, res) => {
  res.json(getFaqItems());
});

faqsRouter.post("/", (req, res) => {
  const questionValue = req.body?.question;
  if (typeof questionValue !== "string" || !questionValue.trim()) {
    res.status(400).json({ message: "Question is required" });
    return;
  }

  const faqItem = addFaqItem(questionValue);
  res.status(201).json(faqItem);
});

export default faqsRouter;
