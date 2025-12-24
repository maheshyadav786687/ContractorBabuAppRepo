namespace CleanArchitectureApp.Application.DTOs;

public record CreateInvoiceDto(
    string ClientId,
    string ProjectId,
    string InvoiceNumber,
    DateTime InvoiceDate,
    decimal SubTotal,
    decimal? TaxAmount = null,
    decimal? RetentionAmount = null,
    decimal? TDSAmount = null,
    string? Notes = null
);

public record UpdateInvoiceDto(
    string? InvoiceNumber = null,
    DateTime? InvoiceDate = null,
    decimal? SubTotal = null,
    decimal? TaxAmount = null,
    decimal? RetentionAmount = null,
    decimal? TDSAmount = null,
    string? Status = null,
    string? Notes = null
);

public record InvoiceResponseDto(
    string Id,
    string ClientId,
    string ClientName,
    string ProjectId,
    string ProjectName,
    string InvoiceNumber,
    DateTime InvoiceDate,
    decimal SubTotal,
    decimal? TaxAmount,
    decimal? RetentionAmount,
    decimal? TDSAmount,
    decimal GrandTotal,
    string Status,
    string? Notes,
    DateTime CreatedAt,
    DateTime? UpdatedAt
);

public record CreateInvoiceItemDto(
    string ItemId,
    decimal Quantity,
    decimal Rate,
    decimal TaxPercentage
);

public record InvoiceItemResponseDto(
    string Id,
    string InvoiceId,
    string ItemId,
    string ItemName,
    decimal Quantity,
    decimal Rate,
    decimal TaxPercentage,
    decimal TaxAmount,
    decimal Amount,
    decimal TotalAmount
);
