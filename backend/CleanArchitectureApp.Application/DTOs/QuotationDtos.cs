namespace CleanArchitectureApp.Application.DTOs;

public record CreateQuotationDto(
    string ProjectId,
    string? SiteId,
    string? Description,
    string? Remarks,
    DateTime? QuotationDate,
    decimal TaxPercentage,
    decimal DiscountPercentage,
    List<CreateQuotationItemDto> Items
);

public record UpdateQuotationDto(
    string? Description,
    string? Remarks,
    DateTime? QuotationDate,
    decimal? TaxPercentage,
    decimal? DiscountPercentage,
    string? Status,
    bool? IsActive
);

public record QuotationResponseDto(
    string Id,
    string QuotationNumber,
    string ProjectId,
    string? ProjectName,
    string? SiteId,
    string? SiteName,
    string? Description,
    string? Remarks,
    DateTime QuotationDate,
    string Status,
    decimal SubTotal,
    decimal TaxPercentage,
    decimal TaxAmount,
    decimal DiscountPercentage,
    decimal DiscountAmount,
    decimal GrandTotal,
    bool IsActive,
    // Client/contact info (optional, mapped from Project.Client when available)
    string? ClientName,
    string? ClientEmail,
    string? ClientPhone,
    string? ClientAddress,
    List<QuotationItemResponseDto> Items,
    DateTime CreatedAt
);

public record CreateQuotationItemDto(
    string? Description,
    decimal Quantity,
    decimal? Area,
    decimal? Length,
    decimal? Width,
    decimal? Height,
    string Unit,
    decimal Rate,
    decimal Amount,
    bool IsWithMaterial,
    int Sequence
);

public record UpdateQuotationItemDto(
    string? Description,
    decimal? Quantity,
    decimal? Area,
    decimal? Length,
    decimal? Width,
    decimal? Height,
    string? Unit,
    decimal? Rate,
    decimal? Amount,
    bool? IsWithMaterial,
    int? Sequence
);

public record QuotationItemResponseDto(
    string Id,
    string QuotationId,
    string? Description,
    decimal Quantity,
    decimal? Area,
    decimal? Length,
    decimal? Width,
    decimal? Height,
    string Unit,
    decimal Rate,
    decimal Amount,
    bool IsWithMaterial,
    int Sequence
);
