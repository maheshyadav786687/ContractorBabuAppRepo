namespace CleanArchitectureApp.Application.DTOs;

public record ProjectCostReportDto(
    string ProjectId,
    string ProjectName,
    decimal TotalExpenseAmount,
    decimal TotalInvoiceAmount,
    decimal TotalLaborCost
);

public record ClientBillingReportDto(
    string ClientId,
    string ClientName,
    decimal TotalInvoicedAmount,
    decimal TotalPaidAmount
);

public record PayrollSummaryDto(
    string LaborId,
    string LaborName,
    decimal TotalWageAmount,
    decimal TotalOvertimeHours,
    decimal NetPayable
);
