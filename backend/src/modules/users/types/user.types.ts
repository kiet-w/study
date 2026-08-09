export interface CreateUserDto {
  email: string;
  username: string;
  password: string;
  name?: string;
}

export interface UserResponseDto {
  id: string;
  email: string;
  username: string;
  name?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  name?: string;
  createdAt: string;
  updatedAt: string;
}
