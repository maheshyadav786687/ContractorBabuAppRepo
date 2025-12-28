import api from './api';
import type { Tenant, UpdateTenantDto } from '@/types/tenant';

export const tenantService = {
    getTenant: async (id: string): Promise<Tenant> => {
        const response = await api.get<Tenant>(`/tenants/${id}`);
        return response.data;
    },

    updateTenant: async (id: string, data: UpdateTenantDto): Promise<Tenant> => {
        const response = await api.put<Tenant>(`/tenants/${id}`, data);
        return response.data;
    }
};

