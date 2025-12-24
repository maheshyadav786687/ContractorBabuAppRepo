using CleanArchitectureApp.Application.DTOs;

namespace CleanArchitectureApp.Application.Interfaces;

public interface IInvoiceService
{
    // Invoice CRUD
    Task<IEnumerable<InvoiceResponseDto>> GetAllAsync(string tenantId);
    Task<InvoiceResponseDto?> GetByIdAsync(string id, string tenantId);
    Task<IEnumerable<InvoiceResponseDto>> GetByProjectAsync(string projectId, string tenantId);
    Task<InvoiceResponseDto> CreateAsync(CreateInvoiceDto dto, string tenantId, string userId);
    Task<InvoiceResponseDto?> UpdateAsync(string id, UpdateInvoiceDto dto, string tenantId, string userId);
    Task<bool> DeleteAsync(string id, string tenantId);

    // Invoice Items
    Task<IEnumerable<InvoiceItemResponseDto>> GetItemsAsync(string invoiceId, string tenantId);
    Task<InvoiceItemResponseDto> AddItemAsync(string invoiceId, CreateInvoiceItemDto dto, string tenantId);
    Task<bool> RemoveItemAsync(string itemId, string tenantId);
}
