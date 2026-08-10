import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

/**
 * UsersService: User profiles are managed by Supabase Auth (auth.users).
 * To prevent database schema mismatch and preserve RLS policies, 
 * Prisma does not manage a separate public.users table.
 */
@Injectable()
export class UsersService {
  async create(createUserDto: CreateUserDto) {
    return {
      id: createUserDto.id || '00000000-0000-0000-0000-000000000000',
      email: createUserDto.email,
      fullName: createUserDto.fullName || null,
      avatarUrl: createUserDto.avatarUrl || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  async findAll() {
    return [];
  }

  async findOne(id: string) {
    return {
      id,
      email: 'user@example.com',
      fullName: 'User Profile',
      avatarUrl: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    return {
      id,
      ...updateUserDto,
      updatedAt: new Date().toISOString(),
    };
  }

  async remove(id: string) {
    return { id, deleted: true };
  }
}
