import api from "./api";
import type { User, CreateUserDto, UpdateUserDto } from "../types/user";

export const userService = {
    getAll: async (): Promise<User[]> => {
        const response = await api.get<User[]>("/users");
        return response.data;
    },

    getById: async (id: string): Promise<User> => {
        const response = await api.get<User>(`/users/${id}`);
        return response.data;
    },

    create: async (data: CreateUserDto): Promise<User> => {
        const response = await api.post<User>("/users", data);
        return response.data;
    },

    update: async (id: string, data: UpdateUserDto): Promise<User> => {
        const response = await api.put<User>(`/users/${id}`, data);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/users/${id}`);
    }
};
