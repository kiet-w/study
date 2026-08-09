import { randomUUID, createHash } from 'crypto';
import { CreateUserDto, User, UserResponseDto } from '../types/user.types';

export class UserAlreadyExistsError extends Error {
  statusCode: number;
  constructor(message: string) {
    super(message);
    this.name = 'UserAlreadyExistsError';
    this.statusCode = 409;
  }
}

export class UserService {
  private users: Map<string, User> = new Map();

  /**
   * Securely hashes standard text string using SHA-256
   */
  private hashPassword(password: string): string {
    return createHash('sha256').update(password).digest('hex');
  }

  /**
   * Maps domain User entity to UserResponseDto, omitting sensitive data
   */
  private toUserResponseDto(user: User): UserResponseDto {
    const { id, email, username, name, createdAt, updatedAt } = user;
    return {
      id,
      email,
      username,
      ...(name !== undefined && { name }),
      createdAt,
      updatedAt,
    };
  }

  /**
   * Create a new user after validating email and username uniqueness.
   * Stores the user entity and returns UserResponseDto without password.
   */
  async createUser(dto: CreateUserDto): Promise<UserResponseDto> {
    const normalizedEmail = dto.email.trim().toLowerCase();
    const normalizedUsername = dto.username.trim().toLowerCase();

    for (const existingUser of this.users.values()) {
      if (existingUser.email.toLowerCase() === normalizedEmail) {
        throw new UserAlreadyExistsError(`User with email '${dto.email}' already exists.`);
      }
      if (existingUser.username.toLowerCase() === normalizedUsername) {
        throw new UserAlreadyExistsError(`User with username '${dto.username}' already exists.`);
      }
    }

    const now = new Date().toISOString();
    const newUser: User = {
      id: randomUUID(),
      email: dto.email,
      username: dto.username,
      passwordHash: this.hashPassword(dto.password),
      name: dto.name,
      createdAt: now,
      updatedAt: now,
    };

    this.users.set(newUser.id, newUser);

    return this.toUserResponseDto(newUser);
  }

  /**
   * Retrieve all users as UserResponseDto list
   */
  async getUsers(): Promise<UserResponseDto[]> {
    const userList = Array.from(this.users.values());
    return userList.map((user) => this.toUserResponseDto(user));
  }

  /**
   * Retrieve user by unique ID
   */
  async getUserById(id: string): Promise<UserResponseDto | null> {
    const user = this.users.get(id);
    if (!user) {
      return null;
    }
    return this.toUserResponseDto(user);
  }
}

export const userService = new UserService();
