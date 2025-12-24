namespace CleanArchitectureApp.Application.DTOs;

public record CreatePayrollDto(
    string LaborId,
    DateTime PeriodStart,
    DateTime PeriodEnd,
    decimal? BonusAmount = null,
    decimal? AdvanceDeduction = null
);

public record PayrollResponseDto(
    string Id,
    string LaborId,
    string LaborName,
    DateTime StartDate,
    DateTime EndDate,
    int TotalDaysPresent,
    decimal TotalWageAmount,
    decimal TotalOvertimeHours,
    decimal? AdvanceDeduction,
    decimal? BonusAmount,
    decimal NetPayable,
    string Status,
    DateTime? PaymentDate,
    string? PaymentMode,
    DateTime CreatedAt
);
