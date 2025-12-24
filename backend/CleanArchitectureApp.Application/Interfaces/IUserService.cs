using CleanArchitectureApp.Application.DTOs;

namespace CleanArchitectureApp.Application.Interfaces;

/// <summary>
/// Service interface for user management operations within a tenant
/// </summary>
public interface IUserService
{
    Task<UserResponseDto?> GetUserByIdAsync(string userId, string tenantId);
    Task<UserResponseDto> CreateUserAsync(CreateUserDto dto, string tenantId);
    Task<UserResponseDto> UpdateUserAsync(string userId, UpdateUserDto dto, string tenantId);
    Task<bool> DeleteUserAsync(string userId, string tenantId);
    Task<IEnumerable<UserResponseDto>> GetUsersByTenantAsync(string tenantId);
}
