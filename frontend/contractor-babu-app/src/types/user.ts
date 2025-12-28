export interface User {
    id: string;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    role: string;
    isActive: boolean;
    createdAt: string;
    lastLoginAt?: string;
}

export interface CreateUserDto {
    username: string;
    email: string;
    password?: string;
    role: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
}

export type UpdateUserDto = Partial<Omit<User, 'id' | 'createdAt' | 'lastLoginAt' | 'username'>>;
