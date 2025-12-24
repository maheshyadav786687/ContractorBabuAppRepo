// Site Types
export interface Site {
    id: string
    name: string
    address: string
    city?: string | null
    state?: string | null
    zipCode?: string | null
    clientId: string
    clientName?: string
    createdAt: string
    createdBy?: string
    updatedAt?: string | null
    updatedBy?: string | null
    isActive: boolean
}

export interface CreateSiteDto {
    name: string
    address: string
    city?: string
    state?: string
    zipCode?: string
    clientId: string
}

export interface UpdateSiteDto {
    name?: string
    address?: string
    city?: string
    state?: string
    zipCode?: string
    isActive?: boolean
}
