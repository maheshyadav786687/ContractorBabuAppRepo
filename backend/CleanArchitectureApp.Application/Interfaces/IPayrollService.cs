using CleanArchitectureApp.Application.DTOs;

namespace CleanArchitectureApp.Application.Interfaces;

public interface IPayrollService
{
    Task<PayrollResponseDto> CreateAsync(CreatePayrollDto dto, string tenantId, string userId);
    Task<PayrollResponseDto?> GetByIdAsync(string id, string tenantId);
    Task<IEnumerable<PayrollResponseDto>> GetAllAsync(string tenantId);
    Task<PayrollResponseDto?> UpdateAsync(string id, CreatePayrollDto dto, string tenantId, string userId);
    Task<bool> DeleteAsync(string id, string tenantId);
}
