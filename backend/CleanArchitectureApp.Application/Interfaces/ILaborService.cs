using CleanArchitectureApp.Application.DTOs;

namespace CleanArchitectureApp.Application.Interfaces;

public interface ILaborService
{
    // Labor
    Task<IEnumerable<LaborResponseDto>> GetAllAsync(string tenantId);
    Task<LaborResponseDto?> GetByIdAsync(string id, string tenantId);
    Task<LaborResponseDto> CreateAsync(CreateLaborDto dto, string tenantId, string userId);
    Task<LaborResponseDto?> UpdateAsync(string id, UpdateLaborDto dto, string tenantId, string userId);
    
    // Attendance
    Task<AttendanceResponseDto> MarkAttendanceAsync(MarkAttendanceDto dto, string tenantId, string userId);
    Task<IEnumerable<AttendanceResponseDto>> GetAttendanceAsync(string siteId, DateTime date, string tenantId);
    
    // Payroll
    Task<PayrollResponseDto> GeneratePayrollAsync(CreatePayrollDto dto, string tenantId, string userId);
    Task<IEnumerable<PayrollResponseDto>> GetPayrollHistoryAsync(string laborId, string tenantId);
}
