import api from './api';
import { dedupe } from './requestDedupe';
import type {
    Quotation,
    CreateQuotationDto,
    UpdateQuotationDto,
    CreateQuotationItemDto,
    UpdateQuotationItemDto,
    QuotationItem
} from '@/types/quotation';

class QuotationService {
    private static instance: QuotationService;

    private constructor() { }

    public static getInstance(): QuotationService {
        if (!QuotationService.instance) {
            QuotationService.instance = new QuotationService();
        }
        return QuotationService.instance;
    }

    async getAll(): Promise<Quotation[]> {
        try {
            return dedupe('quotations:getAll', async () => {
                const response = await api.get<Quotation[]>('/quotations');
                return response.data;
            });
        } catch (error) {
            console.error('Error fetching quotations:', error);
            throw error;
        }
    }

    async getById(id: string): Promise<Quotation> {
        const response = await api.get<Quotation>(`/quotations/${id}`);
        return response.data;
    }

    async getByProject(projectId: string): Promise<Quotation[]> {
        const response = await api.get<Quotation[]>(`/quotations/project/${projectId}`);
        return response.data;
    }

    async getNextNumber(): Promise<string> {
        return dedupe('quotations:getNextNumber', async () => {
            const response = await api.get<{ number: string }>('/quotations/next-number');
            return response.data.number;
        });
    }

    async create(data: CreateQuotationDto): Promise<Quotation> {
        const response = await api.post<Quotation>('/quotations', data);
        return response.data;
    }

    async update(id: string, data: UpdateQuotationDto): Promise<Quotation> {
        const response = await api.put<Quotation>(`/quotations/${id}`, data);
        return response.data;
    }

    async delete(id: string): Promise<void> {
        await api.delete(`/quotations/${id}`);
    }

    // Item operations
    async addItem(quotationId: string, data: CreateQuotationItemDto): Promise<QuotationItem> {
        const response = await api.post<QuotationItem>(`/quotations/${quotationId}/items`, data);
        return response.data;
    }

    async updateItem(itemId: string, data: UpdateQuotationItemDto): Promise<QuotationItem> {
        const response = await api.put<QuotationItem>(`/quotations/items/${itemId}`, data);
        return response.data;
    }

    async removeItem(itemId: string): Promise<void> {
        await api.delete(`/quotations/items/${itemId}`);
    }
}

export const quotationService = QuotationService.getInstance();
