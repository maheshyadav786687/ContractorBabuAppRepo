export interface Item {
    id: string;
    code: string;
    name: string;
    description?: string;
    category: string;
    subCategory?: string;
    unit: string;
    standardRate?: number;
    gstPercentage?: number;
    hsnCode?: string;
    brand?: string;
    specifications?: string;
    isActive: boolean;
}
