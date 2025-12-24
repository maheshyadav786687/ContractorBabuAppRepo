import api from './api';
import type { Client, CreateClientDto, UpdateClientDto } from '@/types/client';
import { dedupe } from './requestDedupe';

class ClientService {
    private static instance: ClientService;

    private constructor() { }

    public static getInstance(): ClientService {
        if (!ClientService.instance) {
            ClientService.instance = new ClientService();
        }
        return ClientService.instance;
    }

    async getAll(): Promise<Client[]> {
        return dedupe('clients:getAll', async () => {
            try {
                const response = await api.get<Client[]>('/clients');
                return response.data;
            } catch (error) {
                console.error('Error fetching clients:', error);
                throw error;
            }
        });
    }

    async getById(id: string): Promise<Client> {
        const response = await api.get<Client>(`/clients/${id}`);
        return response.data;
    }

    async create(data: CreateClientDto): Promise<Client> {
        const response = await api.post<Client>('/clients', data);
        return response.data;
    }

    async update(id: string, data: UpdateClientDto): Promise<Client> {
        const response = await api.put<Client>(`/clients/${id}`, data);
        return response.data;
    }

    async delete(id: string): Promise<void> {
        await api.delete(`/clients/${id}`);
    }
}

export const clientService = ClientService.getInstance();
