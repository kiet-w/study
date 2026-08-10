import { supabase } from './supabase';
import { Category, CreateCategoryInput } from '../types';

export const categoryRepository = {
  async create(userId: string, input: CreateCategoryInput): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .insert({
        user_id: userId,
        name: input.name,
        color: input.color,
        icon: input.icon,
      })
      .select('id, user_id, name, color, icon, sort_order, created_at')
      .single();

    if (error) throw error;
    return data as Category;
  },

  async getByUserId(userId: string): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('id, user_id, name, color, icon, sort_order, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data ?? []) as Category[];
  },

  async delete(categoryId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryId)
      .eq('user_id', userId);

    if (error) throw error;
  },
};
