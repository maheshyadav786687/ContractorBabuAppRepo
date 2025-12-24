using CleanArchitectureApp.Application.DTOs;

namespace CleanArchitectureApp.Application.Interfaces;

public interface IExpenseService
{
    // Heads
    Task<IEnumerable<ExpenseHeadResponseDto>> GetHeadsAsync(string tenantId);
    Task<ExpenseHeadResponseDto> CreateHeadAsync(CreateExpenseHeadDto dto, string tenantId);
    
    // Expenses
    Task<IEnumerable<ExpenseResponseDto>> GetAllAsync(string tenantId);
    Task<IEnumerable<ExpenseResponseDto>> GetByProjectAsync(string projectId, string tenantId);
    Task<ExpenseResponseDto?> GetByIdAsync(string id, string tenantId);
    Task<ExpenseResponseDto> CreateAsync(CreateExpenseDto dto, string tenantId, string userId);
    Task<ExpenseResponseDto?> UpdateAsync(string id, UpdateExpenseDto dto, string tenantId, string userId);
    Task<bool> DeleteAsync(string id, string tenantId);
    Task<bool> ApproveAsync(string id, string tenantId, string userId);
}
