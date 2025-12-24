export interface Client {
    id: string;
    name: string;
    email: string;
    phone: string;
    alternatePhone?: string;
    address?: string;
    city?: string;
    state?: string;
    pinCode?: string;
    gstNumber?: string;
    panNumber?: string;
    contactPerson: string;
    companyType?: string;
    isActive: boolean;
    createdAt: string;
    createdBy?: string;
    updatedAt?: string | null;
    updatedBy?: string | null;
}

export interface CreateClientDto {
    name: string;
    email: string;
    phone: string;
    alternatePhone?: string;
    address?: string;
    city?: string;
    state?: string;
    pinCode?: string;
    gstNumber?: string;
    panNumber?: string;
    contactPerson: string;
    companyType?: string;
}

export interface UpdateClientDto extends Partial<CreateClientDto> {
    isActive?: boolean;
}
