using CleanArchitectureApp.Application.DTOs;

namespace CleanArchitectureApp.Application.Interfaces;

/// <summary>
/// Service interface for tenant management operations
/// </summary>
public interface ITenantService
{
    Task<TenantResponseDto?> GetTenantByIdAsync(string tenantId);
    Task<TenantResponseDto> CreateTenantAsync(CreateTenantDto dto);
    Task<TenantResponseDto> UpdateTenantAsync(string tenantId, UpdateTenantDto dto);
    Task<bool> DeleteTenantAsync(string tenantId);
    Task<IEnumerable<TenantResponseDto>> GetAllTenantsAsync();
}
