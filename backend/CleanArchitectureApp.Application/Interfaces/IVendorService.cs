using CleanArchitectureApp.Application.DTOs;

namespace CleanArchitectureApp.Application.Interfaces;

public interface IVendorService
{
    Task<IEnumerable<VendorResponseDto>> GetAllAsync(string tenantId);
    Task<VendorResponseDto?> GetByIdAsync(string id, string tenantId);
    Task<VendorResponseDto> CreateAsync(CreateVendorDto dto, string tenantId, string userId);
    Task<VendorResponseDto?> UpdateAsync(string id, UpdateVendorDto dto, string tenantId, string userId);
    Task<bool> DeleteAsync(string id, string tenantId);
}
