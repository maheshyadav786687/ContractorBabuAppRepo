namespace CleanArchitectureApp.Application.DTOs;

public record InventoryResponseDto(
    string Id,

    string ItemId,
    string ItemCode,
    string ItemName,
    string Unit,
    decimal Quantity,
    decimal ReorderLevel,
    decimal AverageRate,
    decimal TotalValue,
    DateTime LastUpdated
);

public record CreateTransactionDto(
    string TransactionType, // Inward, Outward, Transfer
    string ReferenceType, // PO, Consumption
    string? ReferenceId,

    string ItemId,
    decimal Quantity,
    string Unit,
    decimal Rate,

    int? ProjectId, // For Consumption
    int? ProjectTaskId, // For Consumption
    string? Remarks
);

public record TransactionResponseDto(
    string Id,
    DateTime TransactionDate,
    string TransactionType,
    string ReferenceType,
    string? ReferenceId,

    string ItemId,
    string ItemName,
    decimal Quantity,
    string Unit,
    decimal Rate,
    decimal Amount,

    string? ProjectId,
    string? ProjectName,
    string? Remarks,
    string? CreatedBy
);
