export interface Tenant {
    id: string;
    companyName: string;
    companyCode: string;
    description: string;
    address: string;
    city: string;
    state: string;
    country: string;
    pinCode: string;
    phone: string;
    email: string;
    gstNumber: string;
    panNumber: string;
    website: string;
    logoUrl?: string;
    subscriptionPlan: string;
    subscriptionEndDate?: string;
    maxUsers: number;
    maxProjects: number;
    currentUsers: number;
    currentProjects: number;
    isActive: boolean;
    createdAt: string;
}

export type UpdateTenantDto = Partial<Omit<Tenant, 'id' | 'createdAt' | 'isActive' | 'companyCode'>>;

