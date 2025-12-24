namespace CleanArchitectureApp.Application.DTOs;

public record CreateClientDto(
    string Name,
    string ContactPerson,
    string Email,
    string Phone,
    string? AlternatePhone,
    string? Address,
    string? City,
    string? State,
    string? PinCode,
    string? GSTNumber,
    string? PANNumber,
    string? CompanyType
);

public record UpdateClientDto(
    string? Name,
    string? ContactPerson,
    string? Email,
    string? Phone,
    string? AlternatePhone,
    string? Address,
    string? City,
    string? State,
    string? PinCode,
    string? GSTNumber,
    string? PANNumber,
    string? CompanyType,
    bool? IsActive
);

public record ClientResponseDto(
    string Id,
    string Name,
    string ContactPerson,
    string Email,
    string Phone,
    string? AlternatePhone,
    string? Address,
    string? City,
    string? State,
    string? PinCode,
    string? GSTNumber,
    string? PANNumber,
    string? CompanyType,
    bool IsActive,
    DateTime CreatedAt,
    DateTime? UpdatedAt
);
