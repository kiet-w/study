import { supabase } from './supabase';
import { Subject, CreateSubjectInput } from '../types';

export const subjectRepository = {
  async create(userId: string, input: CreateSubjectInput): Promise<Subject> {
    const { data, error } = await supabase
      .from('subjects')
      .insert({
        user_id: userId,
        name: input.name,
        color: input.color,
        icon: input.icon,
      })
      .select('id, user_id, name, color, icon, created_at')
      .single();

    if (error) throw error;
    return data as Subject;
  },

  async getByUserId(userId: string): Promise<Subject[]> {
    const { data, error } = await supabase
      .from('subjects')
      .select('id, user_id, name, color, icon, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data ?? []) as Subject[];
  },

  async delete(subjectId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('subjects')
      .delete()
      .eq('id', subjectId)
      .eq('user_id', userId);

    if (error) throw error;
  },
};
