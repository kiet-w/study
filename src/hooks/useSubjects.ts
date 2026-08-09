import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { subjectService } from '../lib/subjectService';
import { Subject, CreateSubjectInput } from '../types';

export function useSubjects() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubjects = useCallback(async () => {
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
        .from('subjects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (dbError) {
        throw new Error(dbError.message);
      }

      setSubjects(data || []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  const createSubject = async (input: CreateSubjectInput): Promise<Subject | undefined> => {
    try {
      setError(null);
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error(userError?.message || 'User not authenticated');
      }

      const newSubject = await subjectService.create(user.id, input);
      setSubjects((prev) => [newSubject, ...prev]);
      return newSubject;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      throw err;
    }
  };

  return {
    subjects,
    loading,
    error,
    createSubject,
    refetch: fetchSubjects,
  };
}

export default useSubjects;
