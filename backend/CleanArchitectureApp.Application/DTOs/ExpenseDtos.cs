namespace CleanArchitectureApp.Application.DTOs;

public record CreateExpenseHeadDto(string Name, string? Description);
public record UpdateExpenseHeadDto(string? Name, string? Description, bool? IsActive);
public record ExpenseHeadResponseDto(string Id, string Name, string? Description, bool IsActive);

public record CreateExpenseDto(
    string ExpenseHeadId,
    string? ProjectId,

    decimal Amount,
    string? Description,
    DateTime? ExpenseDate
);

public record UpdateExpenseDto(
    string? ExpenseHeadId,
    string? ProjectId,

    decimal? Amount,
    string? Description,
    DateTime? ExpenseDate,
    string? Status,
    string? ReceiptUrl
);

public record ExpenseResponseDto(
    string Id,
    string ExpenseHeadId,
    string ExpenseHeadName,
    string? ProjectId,
    string? ProjectName,

    decimal Amount,
    string? Description,
    DateTime ExpenseDate,
    string? SpentById,
    string? SpentByName,
    string Status,
    string? ApprovedById,
    DateTime? ApprovedDate,
    string? ReceiptUrl,
    DateTime CreatedAt
);
