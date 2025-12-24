import api from './api';
import type { Item } from '../types/item';

export const itemService = {
    getAll: async () => {
        const response = await api.get<Item[]>('/items');
        return response.data;
    },

    getById: async (id: string) => {
        const response = await api.get<Item>(`/items/${id}`);
        return response.data;
    }
};
