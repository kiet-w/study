import { useCategories } from './useCategories';
import { CreateCategoryInput } from '../types';

export function useSubjects() {
  const { categories, loading, error, createCategory, refetch } = useCategories();

  return {
    subjects: categories,
    loading,
    error,
    createSubject: (input: CreateCategoryInput) => createCategory(input),
    refetch,
  };
}

export default useSubjects;
