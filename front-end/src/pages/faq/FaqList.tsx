import React from 'react';
import type { FaqItem } from './useFaqData';

type FaqListProps = {
  isFaqLoading: boolean;
  faqItems: FaqItem[];
  error: string | null;
};

function FaqList({ isFaqLoading, faqItems, error }: FaqListProps) {
  return (
    <section className="mt-6 rounded-lg border border-slate-300 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
      <h3 className="text-lg font-semibold">Submitted Questions</h3>
      {isFaqLoading ? (
        <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
          Loading questions...
        </p>
      ) : error && faqItems.length === 0 ? (
        <p className="mt-2 text-sm text-rose-600 dark:text-rose-400">{error}</p>
      ) : faqItems.length === 0 ? (
        <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
          No questions yet.
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {faqItems.map((item) => (
            <li
              key={item.id}
              className="rounded-md bg-slate-100 px-3 py-2 dark:bg-slate-700"
            >
              {item.question}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default FaqList;
