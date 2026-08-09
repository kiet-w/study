import { subjectRepository } from './subjectRepository';
import { Subject, CreateSubjectInput } from '../types';

export const subjectService = {
  async create(userId: string, input: CreateSubjectInput): Promise<Subject> {
    const name = input.name ? input.name.trim() : '';

    if (!name) {
      throw new Error('Tên môn học không được để trống');
    }

    if (name.length > 50) {
      throw new Error('Tên môn học không được vượt quá 50 ký tự');
    }

    if (!input.color || !input.color.trim()) {
      throw new Error('Màu môn học không được để trống');
    }

    if (!input.icon || !input.icon.trim()) {
      throw new Error('Icon môn học không được để trống');
    }

    return subjectRepository.create(userId, {
      ...input,
      name,
    });
  },

  async getByUserId(userId: string): Promise<Subject[]> {
    return subjectRepository.getByUserId(userId);
  },

  async delete(subjectId: string, userId: string): Promise<void> {
    return subjectRepository.delete(subjectId, userId);
  },
};
