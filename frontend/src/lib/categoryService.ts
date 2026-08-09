import { categoryRepository } from './categoryRepository';
import { Category, CreateCategoryInput } from '../types';

export const categoryService = {
  async create(userId: string, input: CreateCategoryInput): Promise<Category> {
    const name = input.name ? input.name.trim() : '';

    if (!name) {
      throw new Error('Tên môn học/danh mục không được để trống');
    }

    if (name.length > 50) {
      throw new Error('Tên môn học/danh mục không được vượt quá 50 ký tự');
    }

    if (!input.color || !input.color.trim()) {
      throw new Error('Màu sắc không được để trống');
    }

    if (!input.icon || !input.icon.trim()) {
      throw new Error('Icon không được để trống');
    }

    return categoryRepository.create(userId, {
      ...input,
      name,
    });
  },

  async getByUserId(userId: string): Promise<Category[]> {
    return categoryRepository.getByUserId(userId);
  },

  async delete(categoryId: string, userId: string): Promise<void> {
    return categoryRepository.delete(categoryId, userId);
  },
};

// Aliases for backwards compatibility
export const subjectService = categoryService;
