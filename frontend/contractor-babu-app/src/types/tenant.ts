export interface Tenant {
    id: number;
    name: string;
    description: string;
    address: string;
    phone: string;
    email: string;
    gstNumber: string;
    panNumber: string;
    website: string;
    logoUrl?: string;
    isActive: boolean;
    createdAt: string;
}

export type UpdateTenantDto = Partial<Omit<Tenant, 'id' | 'createdAt' | 'isActive'>>;
