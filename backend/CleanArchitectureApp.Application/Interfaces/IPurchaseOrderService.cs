using CleanArchitectureApp.Application.DTOs;

namespace CleanArchitectureApp.Application.Interfaces;

public interface IPurchaseOrderService
{
    Task<IEnumerable<PurchaseOrderResponseDto>> GetAllAsync(string tenantId);
    Task<IEnumerable<PurchaseOrderResponseDto>> GetByProjectAsync(string projectId, string tenantId);
    Task<PurchaseOrderResponseDto?> GetByIdAsync(string id, string tenantId);
    Task<PurchaseOrderResponseDto> CreateAsync(CreatePurchaseOrderDto dto, string tenantId, string userId);
    Task<PurchaseOrderResponseDto?> UpdateAsync(string id, UpdatePurchaseOrderDto dto, string tenantId, string userId);
    Task<bool> DeleteAsync(string id, string tenantId);
}
