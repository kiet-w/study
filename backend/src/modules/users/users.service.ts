import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';

export interface UserRecord {
  userId: string;
  email: string;
  fullName?: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class UsersService {
  private usersMap = new Map<string, UserRecord>();

  async create(dto: CreateUserDto): Promise<UserRecord> {
    const existing = this.usersMap.get(dto.userId);
    const record: UserRecord = {
      userId: dto.userId,
      email: dto.email,
      fullName: dto.fullName,
      createdAt: existing ? existing.createdAt : new Date(),
      updatedAt: new Date(),
    };
    this.usersMap.set(dto.userId, record);
    return record;
  }

  async findAll(): Promise<UserRecord[]> {
    return Array.from(this.usersMap.values());
  }

  async findOne(id: string): Promise<UserRecord> {
    const user = this.usersMap.get(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }
}
