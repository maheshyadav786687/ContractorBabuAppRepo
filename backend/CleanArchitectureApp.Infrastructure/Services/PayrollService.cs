using CleanArchitectureApp.Application.DTOs;
using CleanArchitectureApp.Application.Interfaces;
using CleanArchitectureApp.Domain.Entities;
using CleanArchitectureApp.Infrastructure.Data;
using CleanArchitectureApp.Infrastructure.Helpers;
using Microsoft.EntityFrameworkCore;

namespace CleanArchitectureApp.Infrastructure.Services;

public class PayrollService : IPayrollService
{
    private readonly AppDbContext _context;

    public PayrollService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<PayrollResponseDto> CreateAsync(CreatePayrollDto dto, string tenantId, string userId)
    {
        var p = new Payroll
        {
            Id = UlidGenerator.Generate(),
            LaborId = dto.LaborId,
            StartDate = dto.PeriodStart,
            EndDate = dto.PeriodEnd,
            TotalDaysPresent = 0,
            TotalOvertimeHours = 0,
            TotalWageAmount = 0,
            AdvanceDeduction = dto.AdvanceDeduction,
            BonusAmount = dto.BonusAmount,
            NetPayable = 0,
            TenantId = tenantId,
            CreatedBy = userId,
            CreatedAt = DateTime.UtcNow,
            Status = "Draft"
        };

        _context.Payrolls.Add(p);
        await _context.SaveChangesAsync();

        return new PayrollResponseDto(p.Id, p.LaborId, p.Labor?.Name ?? string.Empty, p.StartDate, p.EndDate, p.TotalDaysPresent, p.TotalWageAmount, p.TotalOvertimeHours, p.AdvanceDeduction, p.BonusAmount, p.NetPayable, p.Status, p.PaymentDate, p.PaymentMode, p.CreatedAt);
    }

    public async Task<PayrollResponseDto?> GetByIdAsync(string id, string tenantId)
    {
        var p = await _context.Payrolls.Include(x => x.Labor).FirstOrDefaultAsync(x => x.Id == id && x.TenantId == tenantId);
        if (p == null) return null;
        return new PayrollResponseDto(p.Id, p.LaborId, p.Labor?.Name ?? string.Empty, p.StartDate, p.EndDate, p.TotalDaysPresent, p.TotalWageAmount, p.TotalOvertimeHours, p.AdvanceDeduction, p.BonusAmount, p.NetPayable, p.Status, p.PaymentDate, p.PaymentMode, p.CreatedAt);
    }

    public async Task<IEnumerable<PayrollResponseDto>> GetAllAsync(string tenantId)
    {
        var list = await _context.Payrolls.Include(x => x.Labor).Where(x => x.TenantId == tenantId).ToListAsync();
        return list.Select(p => new PayrollResponseDto(p.Id, p.LaborId, p.Labor?.Name ?? string.Empty, p.StartDate, p.EndDate, p.TotalDaysPresent, p.TotalWageAmount, p.TotalOvertimeHours, p.AdvanceDeduction, p.BonusAmount, p.NetPayable, p.Status, p.PaymentDate, p.PaymentMode, p.CreatedAt));
    }

    public async Task<PayrollResponseDto?> UpdateAsync(string id, CreatePayrollDto dto, string tenantId, string userId)
    {
        var p = await _context.Payrolls.FirstOrDefaultAsync(x => x.Id == id && x.TenantId == tenantId);
        if (p == null) return null;
        p.StartDate = dto.PeriodStart;
        p.EndDate = dto.PeriodEnd;
        p.AdvanceDeduction = dto.AdvanceDeduction;
        p.BonusAmount = dto.BonusAmount;
        // Payroll entity doesn't have UpdatedAt/UpdatedBy in domain - skip
        await _context.SaveChangesAsync();
        return await GetByIdAsync(id, tenantId);
    }

    public async Task<bool> DeleteAsync(string id, string tenantId)
    {
        var p = await _context.Payrolls.FirstOrDefaultAsync(x => x.Id == id && x.TenantId == tenantId);
        if (p == null) return false;
        _context.Payrolls.Remove(p);
        await _context.SaveChangesAsync();
        return true;
    }
}
