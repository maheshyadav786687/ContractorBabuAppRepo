export type LaborCategory = 'Mason' | 'Helper' | 'Carpenter' | 'Electrician' | 'Plumber' | 'Painter' | 'Other';
export type RateType = 'Daily' | 'Hourly' | 'Piece Rate';

export interface Labor {
    id: string;
    tenantId: string;
    name: string;
    phone?: string;
    laborType: string;
    dailyWage: number;
    aadharNumber?: string;
    address?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateLaborDto {
    name: string;
    phone?: string;
    laborType: string;
    dailyWage: number;
    address?: string;
    aadharNumber?: string;
}

export interface UpdateLaborDto extends Partial<CreateLaborDto> {
    isActive?: boolean;
}

export type AttendanceStatus = 'Present' | 'Absent' | 'Half Day';

export interface Attendance {
    id: string;
    tenantId: string;
    laborId: string;
    siteId: string;
    date: string;
    status: AttendanceStatus;
    hoursWorked?: number;
    remarks?: string;
    laborName?: string; // Populated from join
    siteName?: string;  // Populated from join
}

export interface SaveAttendanceDto {
    laborId: string;
    siteId: string;
    date: string;
    status: AttendanceStatus;
    hoursWorked?: number;
    remarks?: string;
}

export type PaymentType = 'Advance' | 'Weekly Payment' | 'Final Settlement' | 'Bonus';

export interface LaborPayment {
    id: string;
    tenantId: string;
    laborId: string;
    amount: number;
    date: string;
    type: PaymentType;
    paymentMethod: 'Cash' | 'Bank Transfer' | 'UPI' | 'Other';
    txnId?: string;
    remarks?: string;
    laborName?: string;
}

export interface CreateLaborPaymentDto {
    laborId: string;
    amount: number;
    date: string;
    type: PaymentType;
    paymentMethod: string;
    txnId?: string;
    remarks?: string;
}

export interface LaborSummary {
    laborId: string;
    laborName: string;
    category: string;
    totalPresent: number;
    totalAbsent: number;
    totalHalfDay: number;
    totalEarnings: number;
    totalPaid: number;
    advanceBalance: number;
    netBalance: number;
}
