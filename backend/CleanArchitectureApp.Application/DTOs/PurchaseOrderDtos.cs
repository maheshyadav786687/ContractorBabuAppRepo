namespace CleanArchitectureApp.Application.DTOs;

public record CreatePurchaseOrderDto(
    string PONumber,
    string VendorId,
    string ProjectId,
    DateTime? ExpectedDeliveryDate,
    string? PaymentTerms,
    string? DeliveryTerms,
    string? Notes,
    List<CreatePurchaseOrderItemDto> Items
);

public record UpdatePurchaseOrderDto(
    DateTime? ExpectedDeliveryDate,
    string? Status,
    string? PaymentTerms,
    string? DeliveryTerms,
    string? Notes,
    bool? IsActive
);

public record PurchaseOrderResponseDto(
    string Id,
    string PONumber,
    string VendorId,
    string VendorName,
    string ProjectId,
    string ProjectName,
    DateTime PODate,
    DateTime? ExpectedDeliveryDate,
    decimal SubTotal,
    decimal? TaxAmount,
    decimal? DiscountAmount,
    decimal GrandTotal,
    string Status,
    string? PaymentTerms,
    string? DeliveryTerms,
    string? Notes,
    bool IsActive,
    List<PurchaseOrderItemResponseDto> Items,
    DateTime CreatedAt,
    DateTime? UpdatedAt
);

public record CreatePurchaseOrderItemDto(
    string ItemId,
    decimal Quantity,
    string Unit,
    decimal Rate,
    decimal? GSTPercentage
);

public record PurchaseOrderItemResponseDto(
    string Id,
    string PurchaseOrderId,
    string ItemId,
    string ItemCode,
    string ItemName,
    decimal Quantity,
    decimal Rate,
    string Unit,
    decimal? GSTPercentage,
    decimal? GSTAmount,
    decimal Amount,
    decimal TotalAmount,
    decimal ReceivedQuantity,
    decimal PendingQuantity
);
