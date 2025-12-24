using CleanArchitectureApp.Application.DTOs;

namespace CleanArchitectureApp.Application.Interfaces;

public interface IClientService
{
    Task<IEnumerable<ClientResponseDto>> GetAllAsync(string tenantId);
    Task<ClientResponseDto?> GetByIdAsync(string id, string tenantId);
    Task<ClientResponseDto> CreateAsync(CreateClientDto dto, string tenantId, string userId);
    Task<ClientResponseDto?> UpdateAsync(string id, UpdateClientDto dto, string tenantId, string userId);
    Task<bool> DeleteAsync(string id, string tenantId);
}
