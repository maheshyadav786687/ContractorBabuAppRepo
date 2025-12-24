using CleanArchitectureApp.Application.DTOs;

namespace CleanArchitectureApp.Application.Interfaces;

public interface IItemService
{
    Task<IEnumerable<ItemResponseDto>> GetAllAsync(string tenantId);
    Task<ItemResponseDto?> GetByIdAsync(string id, string tenantId);
    Task<ItemResponseDto> CreateAsync(CreateItemDto dto, string tenantId, string userId);
    Task<ItemResponseDto?> UpdateAsync(string id, UpdateItemDto dto, string tenantId, string userId);
    Task<bool> DeleteAsync(string id, string tenantId);
}
