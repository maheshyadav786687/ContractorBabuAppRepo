export interface Project {
    id: string;
    projectCode: string;
    name: string;
    description?: string;
    clientId: string;
    clientName?: string;
    siteId?: string;
    siteName?: string;
    projectManagerId?: string;
    projectManagerName?: string;
    projectType: string;
    estimatedBudget?: number;
    actualCost?: number;
    startDate?: string;
    plannedEndDate?: string;
    actualEndDate?: string;
    status: 'Planning' | 'InProgress' | 'OnHold' | 'Completed' | 'Cancelled';
    progressPercentage: number;
    contractType?: string;
    contractValue?: number;
    isActive: boolean;
    createdAt: string;
    updatedAt?: string;
}

export interface CreateProjectDto {
    projectCode: string;
    name: string;
    description?: string;
    clientId: string;
    projectManagerId?: string;
    projectType: string;
    estimatedBudget?: number;
    startDate?: string;
    plannedEndDate?: string;
    contractType?: string;
    contractValue?: number;
}

export interface UpdateProjectDto {
    name?: string;
    description?: string;
    projectManagerId?: string;
    projectType?: string;
    estimatedBudget?: number;
    actualCost?: number;
    startDate?: string;
    plannedEndDate?: string;
    actualEndDate?: string;
    status?: string;
    progressPercentage?: number;
    contractType?: string;
    contractValue?: number;
    isActive?: boolean;
}
