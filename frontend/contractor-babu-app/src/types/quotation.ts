export interface QuotationItem {
    id: string;
    quotationId: string;
    description?: string;
    quantity: number;
    area?: number;
    length?: number;
    width?: number;
    height?: number;
    unit: string;
    rate: number;
    amount: number;
    isWithMaterial: boolean;
    sequence: number;
}

export interface Quotation {
    id: string;
    quotationNumber: string;
    projectId: string;
    projectName?: string;
    siteId?: string;
    siteName?: string;
    // Optional client/contact fields
    clientName?: string;
    clientPhone?: string;
    clientEmail?: string;
    clientAddress?: string;
    description?: string;
    remarks?: string;
    quotationDate: string;
    status: string;
    subTotal: number;
    taxPercentage: number;
    taxAmount: number;
    discountPercentage: number;
    discountAmount: number;
    grandTotal: number;
    isActive: boolean;
    items: QuotationItem[];
    createdAt: string;
}

export interface CreateQuotationItemDto {
    id?: string;
    description?: string;
    quantity: number;
    area?: number;
    length?: number;
    width?: number;
    height?: number;
    unit: string;
    rate: number;
    amount: number;
    isWithMaterial: boolean;
    sequence: number;
}

export interface CreateQuotationDto {
    projectId?: string;
    siteId?: string;
    description?: string;
    remarks?: string;
    quotationDate?: string;
    taxPercentage: number;
    discountPercentage: number;
    items: CreateQuotationItemDto[];
}

export interface UpdateQuotationDto {
    description?: string;
    remarks?: string;
    quotationDate?: string;
    taxPercentage?: number;
    discountPercentage?: number;
    status?: string;
    isActive?: boolean;
}

export interface UpdateQuotationItemDto {
    description?: string;
    quantity?: number;
    area?: number;
    length?: number;
    width?: number;
    height?: number;
    unit?: string;
    rate?: number;
    amount?: number;
    isWithMaterial?: boolean;
    sequence?: number;
}
