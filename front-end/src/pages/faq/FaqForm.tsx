import React, { FormEvent } from 'react';

type FaqFormProps = {
  question: string;
  onQuestionChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
};

function FaqForm({ question, onQuestionChange, onSubmit }: FaqFormProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="mt-6 rounded-lg border border-slate-300 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
    >
      <label htmlFor="faq-question" className="block text-sm font-medium">
        Your Question
      </label>
      <input
        id="faq-question"
        type="text"
        value={question}
        onChange={(event) => onQuestionChange(event.target.value)}
        className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-700"
        placeholder="Type your question"
      />
      <button
        type="submit"
        className="mt-3 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
      >
        Submit
      </button>
    </form>
  );
}

export default FaqForm;
