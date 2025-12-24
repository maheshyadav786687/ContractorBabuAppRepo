import api from './api'
import type { Site, CreateSiteDto, UpdateSiteDto } from '@/types/site'
import { dedupe } from './requestDedupe'

export const siteService = {
    async getAll(): Promise<Site[]> {
        return dedupe('sites:getAll', async () => {
            const response = await api.get('/sites')
            return response.data
        })
    },

    async getById(id: string): Promise<Site> {
        const response = await api.get(`/sites/${id}`)
        return response.data
    },

    async getByClientId(clientId: string): Promise<Site[]> {
        const response = await api.get(`/sites/client/${clientId}`)
        return response.data
    },

    async create(data: CreateSiteDto): Promise<Site> {
        const response = await api.post('/sites', data)
        return response.data
    },

    async update(id: string, data: UpdateSiteDto): Promise<Site> {
        const response = await api.put(`/sites/${id}`, data)
        return response.data
    },

    async delete(id: string): Promise<void> {
        await api.delete(`/sites/${id}`)
    }
}
