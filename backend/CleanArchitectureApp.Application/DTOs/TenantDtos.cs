namespace CleanArchitectureApp.Application.DTOs;

/// <summary>
/// DTO for creating a new tenant registration
/// </summary>
public record CreateTenantDto(
    string CompanyName,
    string? CompanyCode,
    string Email,
    string? Phone,
    string? Address,
    string? City,
    string? State,
    string? GSTNumber,
    string? PANNumber,
    string SubscriptionPlan = "Free"
);

/// <summary>
/// DTO for updating tenant information
/// </summary>
public record UpdateTenantDto(
    string CompanyName,
    string Email,
    string? Description,
    string? Phone,
    string? Address,
    string? City,
    string? State,
    string? Country,
    string? PinCode,
    string? GSTNumber,
    string? PANNumber,
    string? Website,
    string? LogoUrl
);

/// <summary>
/// DTO for tenant response with company details
/// </summary>
public record TenantResponseDto(
    string Id,
    string CompanyName,
    string? Description,
    string? CompanyCode,
    string? Email,
    string? Phone,
    string? Address,
    string? City,
    string? State,
    string? Country,
    string? PinCode,
    string? GSTNumber,
    string? PANNumber,
    string? Website,
    string? LogoUrl,
    string SubscriptionPlan,
    DateTime? SubscriptionEndDate,
    bool IsActive,
    int MaxUsers,
    int MaxProjects,
    int CurrentUsers,
    int CurrentProjects
);

