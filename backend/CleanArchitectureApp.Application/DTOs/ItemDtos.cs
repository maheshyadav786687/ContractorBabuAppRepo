namespace CleanArchitectureApp.Application.DTOs;

public record CreateItemDto(
    string Code,
    string Name,
    string? Description,
    string Category,
    string? SubCategory,
    string Unit,
    decimal? StandardRate,
    decimal? MinRate,
    decimal? MaxRate,
    decimal? GSTPercentage,
    string? HSNCode,
    string? Brand,
    string? Specifications
);

public record UpdateItemDto(
    string? Name,
    string? Description,
    string? Category,
    string? SubCategory,
    string? Unit,
    decimal? StandardRate,
    decimal? MinRate,
    decimal? MaxRate,
    decimal? GSTPercentage,
    string? HSNCode,
    string? Brand,
    string? Specifications,
    bool? IsActive
);

public record ItemResponseDto(
    string Id,
    string Code,
    string Name,
    string? Description,
    string Category,
    string? SubCategory,
    string Unit,
    decimal? StandardRate,
    decimal? MinRate,
    decimal? MaxRate,
    decimal? GSTPercentage,
    string? HSNCode,
    string? Brand,
    string? Specifications,
    bool IsActive,
    DateTime CreatedAt,
    DateTime? UpdatedAt
);
