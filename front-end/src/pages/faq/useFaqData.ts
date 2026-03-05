import { FormEvent, useEffect, useState } from 'react';
import { formatBackendError } from '@/utils/apiError';

export type FaqItem = {
  id: number;
  question: string;
};

export function useFaqData() {
  const [question, setQuestion] = useState('');
  const [faqItems, setFaqItems] = useState<FaqItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isFaqLoading, setIsFaqLoading] = useState(true);

  const loadFaqItems = async () => {
    try {
      setError(null);
      setIsFaqLoading(true);
      const response = await fetch('http://localhost:5000/api/faqs');
      if (!response.ok) {
        throw new Error('Failed to load FAQ items');
      }
      const data = (await response.json()) as FaqItem[];
      setFaqItems(data);
    } catch (loadError) {
      setFaqItems([]);
      setError(formatBackendError(loadError, 'FAQ items'));
    } finally {
      setIsFaqLoading(false);
    }
  };

  useEffect(() => {
    void loadFaqItems();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      setError(null);
      const response = await fetch('http://localhost:5000/api/faqs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question }),
      });
      if (!response.ok) {
        throw new Error('Failed to submit question');
      }

      const createdItem = (await response.json()) as FaqItem;
      setFaqItems((currentItems) => [...currentItems, createdItem]);
      setQuestion('');
    } catch (submitError) {
      setError(formatBackendError(submitError, 'question submission'));
    }
  };

  return {
    question,
    setQuestion,
    faqItems,
    error,
    isFaqLoading,
    handleSubmit,
  };
}
