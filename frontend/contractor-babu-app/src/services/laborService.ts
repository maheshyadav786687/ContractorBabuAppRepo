import api from './api';
import { dedupe } from './requestDedupe';
import type {
    Labor,
    CreateLaborDto,
    UpdateLaborDto,
} from '@/types/labor';

class LaborService {
    private static instance: LaborService;

    private constructor() { }

    public static getInstance(): LaborService {
        if (!LaborService.instance) {
            LaborService.instance = new LaborService();
        }
        return LaborService.instance;
    }

    // Labor Profile Management
    async getAll(): Promise<Labor[]> {
        return dedupe('labor:getAll', async () => {
            const response = await api.get<Labor[]>('/labor');
            return response.data;
        });
    }

    async getById(id: string): Promise<Labor> {
        const response = await api.get<Labor>(`/labor/${id}`);
        return response.data;
    }

    async create(data: CreateLaborDto): Promise<Labor> {
        // Backend expects laborType, dailyWage, aadharNumber.
        // Frontend CreateLaborDto now has these fields.
        const response = await api.post<Labor>('/labor', data);
        return response.data;
    }

    async update(id: string, data: UpdateLaborDto): Promise<Labor> {
        const response = await api.put<Labor>(`/labor/${id}`, data);
        return response.data;
    }

    async delete(id: string): Promise<void> {
        await api.delete(`/labor/${id}`);
    }

    // Attendance Management
    async getAttendance(siteId: string, date: string): Promise<any[]> {
        const response = await api.get(`/labor/attendance/site/${siteId}`, { params: { date } });
        return response.data;
    }

    async markAttendance(data: any): Promise<void> {
        await api.post('/labor/attendance', data);
    }

    async saveAttendanceBulk(data: any[]): Promise<void> {
        await api.post('/labor/attendance/bulk', { attendance: data });
    }

    // Payroll & Payment Management
    async getPayments(laborId?: string): Promise<any[]> {
        if (!laborId) return [];
        const response = await api.get(`/labor/payroll/labor/${laborId}`);
        return response.data;
    }

    async createPayment(data: any): Promise<any> {
        const response = await api.post('/labor/payroll', data);
        return response.data;
    }

    // Financial Summary & Payroll History
    async getSummary(laborId: string): Promise<any[]> {
        const response = await api.get(`/labor/payroll/labor/${laborId}`);
        return response.data;
    }
}

export const laborService = LaborService.getInstance();
