using CleanArchitectureApp.Application.DTOs;

namespace CleanArchitectureApp.Application.Interfaces;

public interface IInventoryService
{
    // Inventory
    Task<IEnumerable<InventoryResponseDto>> GetStockBySiteAsync(string siteId, string tenantId);
    Task<InventoryResponseDto?> GetItemStockAsync(string siteId, string itemId, string tenantId);
    
    // Transactions
    Task<TransactionResponseDto> ProcessTransactionAsync(CreateTransactionDto dto, string tenantId, string userId);
    Task<IEnumerable<TransactionResponseDto>> GetTransactionsBySiteAsync(string siteId, string tenantId);
}
