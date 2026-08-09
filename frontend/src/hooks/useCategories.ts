import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { categoryService } from '../lib/categoryService';
import { Category, CreateCategoryInput } from '../types';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error(userError?.message || 'User not authenticated');
      }

      const { data, error: dbError } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (dbError) {
        throw new Error(dbError.message);
      }

      setCategories(data || []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const createCategory = async (input: CreateCategoryInput): Promise<Category | undefined> => {
    try {
      setError(null);
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error(userError?.message || 'User not authenticated');
      }

      const newCategory = await categoryService.create(user.id, input);
      setCategories((prev) => [newCategory, ...prev]);
      return newCategory;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      throw err;
    }
  };

  return {
    categories,
    loading,
    error,
    createCategory,
    refetch: fetchCategories,
  };
}

export default useCategories;
