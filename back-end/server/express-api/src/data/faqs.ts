import { FaqItem } from "../types/faq";

const faqItems: FaqItem[] = [];
let nextFaqId = 1;

export const getFaqItems = (): FaqItem[] => faqItems;

export const addFaqItem = (question: string): FaqItem => {
  const faqItem: FaqItem = {
    id: nextFaqId,
    question: question.trim()
  };

  nextFaqId += 1;
  faqItems.push(faqItem);
  return faqItem;
};
