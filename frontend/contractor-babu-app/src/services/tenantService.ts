import api from './api';
import type { Tenant, UpdateTenantDto } from '@/types/tenant';

export const tenantService = {
    getTenant: async (id: number): Promise<Tenant> => {
        const response = await api.get<Tenant>(`/tenants/${id}`);
        return response.data;
    },

    updateTenant: async (id: number, data: UpdateTenantDto): Promise<Tenant> => {
        const response = await api.put<Tenant>(`/tenants/${id}`, data);
        return response.data;
    }
};
