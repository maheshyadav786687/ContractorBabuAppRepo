import api from './api';
import type { Project, CreateProjectDto, UpdateProjectDto } from '@/types/project';
import { dedupe } from './requestDedupe';

export const projectService = {
    getAll: async () => {
        return dedupe('projects:getAll', async () => {
            const response = await api.get<Project[]>('/projects');
            return response.data;
        });
    },

    getById: async (id: string) => {
        const response = await api.get<Project>(`/projects/${id}`);
        return response.data;
    },

    create: async (data: CreateProjectDto) => {
        const response = await api.post<Project>('/projects', data);
        return response.data;
    },

    update: async (id: string, data: UpdateProjectDto) => {
        const response = await api.put<Project>(`/projects/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        await api.delete(`/projects/${id}`);
    }
};
