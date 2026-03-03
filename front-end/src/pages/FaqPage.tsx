import { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AppHeader from "../components/AppHeader";
import StoreLogo from "../components/StoreLogo";
import ThemeToggleButton from "../components/ThemeToggleButton";

type FaqItem = {
  id: number;
  question: string;
};

function FaqPage() {
  const [question, setQuestion] = useState("");
  const [faqItems, setFaqItems] = useState<FaqItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadFaqItems = async () => {
    try {
      setError(null);
      const response = await fetch("http://localhost:5000/api/faqs");
      if (!response.ok) {
        throw new Error("Failed to load FAQ items");
      }
      const data = (await response.json()) as FaqItem[];
      setFaqItems(data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Something went wrong");
    }
  };

  useEffect(() => {
    void loadFaqItems();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      setError(null);
      const response = await fetch("http://localhost:5000/api/faqs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ question })
      });
      if (!response.ok) {
        throw new Error("Failed to submit question");
      }

      const createdItem = (await response.json()) as FaqItem;
      setFaqItems((currentItems) => [...currentItems, createdItem]);
      setQuestion("");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 transition-colors dark:bg-slate-900 dark:text-slate-100">
      <AppHeader
        left={(
          <Link to="/" className="inline-flex items-center">
            <StoreLogo
              className="h-12 mt-1"
              imgClassName="h-12 w-auto"
              textClassName="text-xl font-bold"
            />
          </Link>
        )}
        right={(
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              Back to Home
            </Link>
            <ThemeToggleButton />
          </div>
        )}
      />

      <main className="mx-auto max-w-4xl px-6 py-10">
        <h2 className="text-3xl font-extrabold">FAQ</h2>
        <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
          Enter your question and submit.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-6 rounded-lg border border-slate-300 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
        >
          <label htmlFor="faq-question" className="block text-sm font-medium">
            Your Question
          </label>
          <input
            id="faq-question"
            type="text"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
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

        {error ? (
          <p className="mt-3 text-sm text-rose-600 dark:text-rose-400">{error}</p>
        ) : null}

        <section className="mt-6 rounded-lg border border-slate-300 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
          <h3 className="text-lg font-semibold">Submitted Questions</h3>
          {faqItems.length === 0 ? (
            <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
              No questions yet.
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {faqItems.map((item) => (
                <li key={item.id} className="rounded-md bg-slate-100 px-3 py-2 dark:bg-slate-700">
                  {item.question}
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

export default FaqPage;

