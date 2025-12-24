namespace CleanArchitectureApp.Application.DTOs;

public record CreateVendorDto(
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
    string? BankName,
    string? AccountNumber,
    string? IFSC,
    string VendorType,
    int? Rating
);

public record UpdateVendorDto(
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
    string? BankName,
    string? AccountNumber,
    string? IFSC,
    string? VendorType,
    int? Rating,
    bool? IsActive
);

public record VendorResponseDto(
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
    string? BankName,
    string? AccountNumber,
    string? IFSC,
    string VendorType,
    int Rating,
    bool IsActive,
    DateTime CreatedAt,
    DateTime? UpdatedAt
);
