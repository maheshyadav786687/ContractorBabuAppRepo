using CleanArchitectureApp.Application.DTOs;

namespace CleanArchitectureApp.Application.Interfaces;

public interface IQuotationService
{
    Task<IEnumerable<QuotationResponseDto>> GetAllAsync(string tenantId);
    Task<IEnumerable<QuotationResponseDto>> GetByProjectAsync(string projectId, string tenantId);
    Task<QuotationResponseDto?> GetByIdAsync(string id, string tenantId);
    Task<QuotationResponseDto> CreateAsync(CreateQuotationDto dto, string tenantId, string userId);
    Task<QuotationResponseDto?> UpdateAsync(string id, UpdateQuotationDto dto, string tenantId, string userId);
    Task<bool> DeleteAsync(string id, string tenantId);
    
    Task<string> GetNextQuotationNumberAsync(string tenantId);
    
    // Quotation Items
    Task<QuotationItemResponseDto> AddItemAsync(string quotationId, CreateQuotationItemDto dto, string tenantId, string userId);
    Task<QuotationItemResponseDto?> UpdateItemAsync(string itemId, UpdateQuotationItemDto dto, string tenantId, string userId);
    Task<bool> RemoveItemAsync(string itemId, string tenantId);
}
