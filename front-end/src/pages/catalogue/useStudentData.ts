import { useEffect, useState } from 'react';
import { formatBackendError } from '@/utils/apiError';

type StudentItem = {
  item: string;
  quantity: string;
  price: number;
};

export function useStudentData() {
  const [studentItems, setStudentItems] = useState<StudentItem[]>([]);
  const [studentsError, setStudentsError] = useState<string | null>(null);
  const [isStudentsLoading, setIsStudentsLoading] = useState(true);

  useEffect(() => {
    const loadStudentItems = async () => {
      try {
        setStudentsError(null);
        setIsStudentsLoading(true);
        const response = await fetch(
          'http://localhost:5000/api/catalogue/students'
        );
        if (!response.ok) {
          throw new Error('Failed to load student items');
        }
        const data = (await response.json()) as StudentItem[];
        setStudentItems(data);
      } catch (error) {
        setStudentsError(formatBackendError(error, 'student items'));
      } finally {
        setIsStudentsLoading(false);
      }
    };

    void loadStudentItems();
  }, []);

  return { studentItems, studentsError, isStudentsLoading };
}
