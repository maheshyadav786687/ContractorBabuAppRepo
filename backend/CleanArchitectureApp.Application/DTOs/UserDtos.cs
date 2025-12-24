namespace CleanArchitectureApp.Application.DTOs;

/// <summary>
/// DTO for creating a new user
/// </summary>
public record CreateUserDto(
    string Username,
    string Email,
    string Password,
    string Role,
    string? FirstName,
    string? LastName,
    string? Phone
);

/// <summary>
/// DTO for updating user information
/// </summary>
public record UpdateUserDto(
    string? Email,
    string? FirstName,
    string? LastName,
    string? Phone,
    string? Role,
    bool? IsActive
);

/// <summary>
/// DTO for user response
/// </summary>
public record UserResponseDto(
    string Id,
    string Username,
    string Email,
    string? FirstName,
    string? LastName,
    string? Phone,
    string Role,
    bool IsActive,
    DateTime CreatedAt,
    DateTime? LastLoginAt
);
