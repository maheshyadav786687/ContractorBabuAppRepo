using CleanArchitectureApp.Application.DTOs;
using CleanArchitectureApp.Application.Interfaces;
using CleanArchitectureApp.Domain.Entities;
using CleanArchitectureApp.Infrastructure.Data;
using CleanArchitectureApp.Infrastructure.Helpers;
using Microsoft.EntityFrameworkCore;

namespace CleanArchitectureApp.Infrastructure.Services;

public class LaborService : ILaborService
{
    private readonly AppDbContext _context;

    public LaborService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<LaborResponseDto>> GetAllAsync(string tenantId)
    {
        var labors = await _context.Labors.Where(l => l.TenantId == tenantId).ToListAsync();
        return labors.Select(l => new LaborResponseDto(l.Id, l.Name, l.Phone, l.LaborType, l.DailyWage, l.Address, l.AadharNumber, l.IsActive, l.CreatedAt));
    }

    public async Task<LaborResponseDto?> GetByIdAsync(string id, string tenantId)
    {
        var l = await _context.Labors.FirstOrDefaultAsync(x => x.Id == id && x.TenantId == tenantId);
        if (l == null) return null;
        return new LaborResponseDto(l.Id, l.Name, l.Phone, l.LaborType, l.DailyWage, l.Address, l.AadharNumber, l.IsActive, l.CreatedAt);
    }

    public async Task<LaborResponseDto> CreateAsync(CreateLaborDto dto, string tenantId, string userId)
    {
        var l = new Labor { Id = UlidGenerator.Generate(), Name = dto.Name, Phone = dto.Phone, LaborType = dto.LaborType, DailyWage = dto.DailyWage, Address = dto.Address, AadharNumber = dto.AadharNumber, TenantId = tenantId, CreatedBy = userId, CreatedAt = DateTime.UtcNow, IsActive = true };
        _context.Labors.Add(l);
        await _context.SaveChangesAsync();
        return new LaborResponseDto(l.Id, l.Name, l.Phone, l.LaborType, l.DailyWage, l.Address, l.AadharNumber, l.IsActive, l.CreatedAt);
    }

    public async Task<LaborResponseDto?> UpdateAsync(string id, UpdateLaborDto dto, string tenantId, string userId)
    {
        var l = await _context.Labors.FirstOrDefaultAsync(x => x.Id == id && x.TenantId == tenantId);
        if (l == null) return null;
        l.Name = dto.Name ?? l.Name;
        l.Phone = dto.Phone ?? l.Phone;
        l.LaborType = dto.LaborType ?? l.LaborType;
        l.DailyWage = dto.DailyWage ?? l.DailyWage;
        l.Address = dto.Address ?? l.Address;
        l.AadharNumber = dto.AadharNumber ?? l.AadharNumber;
        l.IsActive = dto.IsActive ?? l.IsActive;
        // Labor entity does not track UpdatedAt/UpdatedBy - don't set
        await _context.SaveChangesAsync();
        return new LaborResponseDto(l.Id, l.Name, l.Phone, l.LaborType, l.DailyWage, l.Address, l.AadharNumber, l.IsActive, l.CreatedAt);
    }

    public async Task<AttendanceResponseDto> MarkAttendanceAsync(MarkAttendanceDto dto, string tenantId, string userId)
    {
        var labor = await _context.Labors.FirstOrDefaultAsync(l => l.Id == dto.LaborId && l.TenantId == tenantId);
        if (labor == null) throw new InvalidOperationException("Labor not found");

        // Calculate wage for the day
        var baseWage = labor.DailyWage;
        var dayFactor = dto.IsHalfDay ? 0.5m : 1m;
        var overtimeRatePerHour = baseWage / 8m;
        var wageForDay = baseWage * dayFactor + (dto.OvertimeHours * overtimeRatePerHour);

        var attendance = new Attendance
        {
            Id = UlidGenerator.Generate(),
            Date = dto.Date,
            LaborId = dto.LaborId,
            IsPresent = dto.IsPresent,
            IsHalfDay = dto.IsHalfDay,
            OvertimeHours = dto.OvertimeHours,
            WageForDay = wageForDay,
            TenantId = tenantId,
            CreatedBy = userId,
            CreatedAt = DateTime.UtcNow
        };
        _context.Attendances.Add(attendance);
        await _context.SaveChangesAsync();
        return new AttendanceResponseDto(attendance.Id, attendance.Date, attendance.LaborId, attendance.Labor?.Name ?? string.Empty, attendance.IsPresent, attendance.IsHalfDay, attendance.OvertimeHours, attendance.WageForDay);
    }

    public async Task<IEnumerable<AttendanceResponseDto>> GetAttendanceAsync(string siteId, DateTime date, string tenantId)
    {
        var at = await _context.Attendances.Where(a => a.Date.Date == date.Date && a.TenantId == tenantId).ToListAsync();
        return at.Select(a => new AttendanceResponseDto(a.Id, a.Date, a.LaborId, a.Labor?.Name ?? string.Empty, a.IsPresent, a.IsHalfDay, a.OvertimeHours, a.WageForDay));
    }

    public async Task<PayrollResponseDto> GeneratePayrollAsync(CreatePayrollDto dto, string tenantId, string userId)
    {
        // Period fields in DTO are PeriodStart/PeriodEnd
        var start = dto.PeriodStart;
        var end = dto.PeriodEnd;

        // Aggregate attendance for labor in the period
        var attendances = await _context.Attendances.Where(a => a.LaborId == dto.LaborId && a.Date.Date >= start.Date && a.Date.Date <= end.Date && a.TenantId == tenantId).ToListAsync();
        var totalDays = attendances.Count(a => a.IsPresent);
        var totalOvertime = attendances.Sum(a => a.OvertimeHours);
        var totalWage = attendances.Sum(a => a.WageForDay);

        var net = totalWage - (dto.AdvanceDeduction ?? 0m) + (dto.BonusAmount ?? 0m);

        var p = new Payroll
        {
            Id = UlidGenerator.Generate(),
            LaborId = dto.LaborId,
            StartDate = start,
            EndDate = end,
            TotalDaysPresent = totalDays,
            TotalOvertimeHours = totalOvertime,
            TotalWageAmount = totalWage,
            AdvanceDeduction = dto.AdvanceDeduction,
            BonusAmount = dto.BonusAmount,
            NetPayable = net,
            TenantId = tenantId,
            CreatedBy = userId,
            CreatedAt = DateTime.UtcNow,
            Status = "Generated"
        };

        _context.Payrolls.Add(p);
        await _context.SaveChangesAsync();

        return new PayrollResponseDto(p.Id, p.LaborId, p.Labor?.Name ?? string.Empty, p.StartDate, p.EndDate, p.TotalDaysPresent, p.TotalWageAmount, p.TotalOvertimeHours, p.AdvanceDeduction, p.BonusAmount, p.NetPayable, p.Status, p.PaymentDate, p.PaymentMode, p.CreatedAt);
    }

    public async Task<IEnumerable<PayrollResponseDto>> GetPayrollHistoryAsync(string laborId, string tenantId)
    {
        var list = await _context.Payrolls.Where(p => p.LaborId == laborId && p.TenantId == tenantId).ToListAsync();
        return list.Select(p => new PayrollResponseDto(p.Id, p.LaborId, p.Labor?.Name ?? string.Empty, p.StartDate, p.EndDate, p.TotalDaysPresent, p.TotalWageAmount, p.TotalOvertimeHours, p.AdvanceDeduction, p.BonusAmount, p.NetPayable, p.Status, p.PaymentDate, p.PaymentMode, p.CreatedAt));
    }
}
