import { Link } from 'react-router-dom';
import AppHeader from '@/components/layout/AppHeader';
import PageMain from '@/components/layout/PageMain';
import PageShell from '@/components/layout/PageShell';
import StoreLogo from '@/components/shared/StoreLogo';
import ThemeToggleButton from '@/components/theme/ThemeToggleButton';
import FaqForm from '@/pages/faq/FaqForm';
import FaqList from '@/pages/faq/FaqList';
import { useFaqData } from '@/pages/faq/useFaqData';

function FaqPage() {
  const { question, setQuestion, faqItems, error, isFaqLoading, handleSubmit } =
    useFaqData();

  return (
    <PageShell>
      <AppHeader
        left={
          <Link to="/" className="inline-flex items-center">
            <StoreLogo
              className="h-12"
              imgClassName="h-12 w-auto"
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

      <PageMain className="mx-auto max-w-4xl py-10">
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
      </PageMain>
    </PageShell>
  );
}

export default FaqPage;
