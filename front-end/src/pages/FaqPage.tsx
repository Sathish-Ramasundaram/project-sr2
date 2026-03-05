import { Link } from 'react-router-dom';
import AppHeader from '@/components/AppHeader';
import StoreLogo from '@/components/StoreLogo';
import ThemeToggleButton from '@/components/ThemeToggleButton';
import FaqForm from '@/pages/faq/FaqForm';
import FaqList from '@/pages/faq/FaqList';
import { useFaqData } from '@/pages/faq/useFaqData';

function FaqPage() {
  const { question, setQuestion, faqItems, error, isFaqLoading, handleSubmit } =
    useFaqData();

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 transition-colors dark:bg-slate-900 dark:text-slate-100">
      <AppHeader
        left={
          <Link to="/" className="inline-flex items-center">
            <StoreLogo
              className="h-12"
              imgClassName="h-12 w-auto"
              textClassName="text-xl font-bold"
            />
          </Link>
        }
        right={
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              Back to Home
            </Link>
            <ThemeToggleButton />
          </div>
        }
      />

      <main className="mx-auto max-w-4xl px-6 py-10">
        <h2 className="text-3xl font-extrabold">FAQ</h2>
        <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
          Enter your question and submit.
        </p>

        <FaqForm
          question={question}
          onQuestionChange={setQuestion}
          onSubmit={handleSubmit}
        />

        {error ? (
          <p className="mt-3 text-sm text-rose-600 dark:text-rose-400">
            {error}
          </p>
        ) : null}

        <FaqList
          isFaqLoading={isFaqLoading}
          faqItems={faqItems}
          error={error}
        />
      </main>
    </div>
  );
}

export default FaqPage;
