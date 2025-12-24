using CleanArchitectureApp.Application.DTOs;
using CleanArchitectureApp.Application.Interfaces;
using CleanArchitectureApp.Domain.Entities;
using CleanArchitectureApp.Infrastructure.Data;
using CleanArchitectureApp.Infrastructure.Helpers;
using Microsoft.EntityFrameworkCore;

namespace CleanArchitectureApp.Infrastructure.Services;

public class ExpenseService : IExpenseService
{
    private readonly AppDbContext _context;

    public ExpenseService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<ExpenseHeadResponseDto>> GetHeadsAsync(string tenantId)
    {
        var heads = await _context.ExpenseHeads.Where(h => h.TenantId == tenantId).ToListAsync();
        return heads.Select(h => new ExpenseHeadResponseDto(h.Id, h.Name, h.Description, h.IsActive));
    }

    public async Task<ExpenseHeadResponseDto> CreateHeadAsync(CreateExpenseHeadDto dto, string tenantId)
    {
        var head = new ExpenseHead { Id = UlidGenerator.Generate(), Name = dto.Name, Description = dto.Description, TenantId = tenantId };
        _context.ExpenseHeads.Add(head);
        await _context.SaveChangesAsync();
        return new ExpenseHeadResponseDto(head.Id, head.Name, head.Description, head.IsActive);
    }

    public async Task<IEnumerable<ExpenseResponseDto>> GetAllAsync(string tenantId)
    {
        var expenses = await _context.Expenses.Where(e => e.TenantId == tenantId).ToListAsync();
        return expenses.Select(e => new ExpenseResponseDto(e.Id, e.ExpenseHeadId, e.ExpenseHead?.Name ?? "", e.ProjectId, e.Project?.Name, e.Amount, e.Description, e.ExpenseDate, e.SpentById, e.SpentBy?.Username, e.Status, e.ApprovedById, e.ApprovedDate, e.ReceiptUrl, e.CreatedAt));
    }

    public async Task<IEnumerable<ExpenseResponseDto>> GetByProjectAsync(string projectId, string tenantId)
    {
        var expenses = await _context.Expenses.Where(e => e.ProjectId == projectId && e.TenantId == tenantId).ToListAsync();
        return expenses.Select(e => new ExpenseResponseDto(e.Id, e.ExpenseHeadId, e.ExpenseHead?.Name ?? "", e.ProjectId, e.Project?.Name, e.Amount, e.Description, e.ExpenseDate, e.SpentById, e.SpentBy?.Username, e.Status, e.ApprovedById, e.ApprovedDate, e.ReceiptUrl, e.CreatedAt));
    }

    public async Task<ExpenseResponseDto?> GetByIdAsync(string id, string tenantId)
    {
        var e = await _context.Expenses.Include(x => x.ExpenseHead).Include(x => x.Project).Include(x => x.SpentBy).FirstOrDefaultAsync(x => x.Id == id && x.TenantId == tenantId);
        if (e == null) return null;
        return new ExpenseResponseDto(e.Id, e.ExpenseHeadId, e.ExpenseHead?.Name ?? "", e.ProjectId, e.Project?.Name, e.Amount, e.Description, e.ExpenseDate, e.SpentById, e.SpentBy?.Username, e.Status, e.ApprovedById, e.ApprovedDate, e.ReceiptUrl, e.CreatedAt);
    }

    public async Task<ExpenseResponseDto> CreateAsync(CreateExpenseDto dto, string tenantId, string userId)
    {
        var exp = new Expense
        {
            Id = UlidGenerator.Generate(),
            ExpenseHeadId = dto.ExpenseHeadId,
            ProjectId = dto.ProjectId,
            Amount = dto.Amount,
            Description = dto.Description,
            ExpenseDate = dto.ExpenseDate ?? DateTime.UtcNow,
            TenantId = tenantId,
            CreatedBy = userId,
            CreatedAt = DateTime.UtcNow,
            Status = "Pending"
        };

        _context.Expenses.Add(exp);
        await _context.SaveChangesAsync();
        return new ExpenseResponseDto(exp.Id, exp.ExpenseHeadId, exp.ExpenseHead?.Name ?? "", exp.ProjectId, exp.Project?.Name, exp.Amount, exp.Description, exp.ExpenseDate, exp.SpentById, exp.SpentBy?.Username, exp.Status, exp.ApprovedById, exp.ApprovedDate, exp.ReceiptUrl, exp.CreatedAt);
    }

    public async Task<ExpenseResponseDto?> UpdateAsync(string id, UpdateExpenseDto dto, string tenantId, string userId)
    {
        var exp = await _context.Expenses.FirstOrDefaultAsync(e => e.Id == id && e.TenantId == tenantId);
        if (exp == null) return null;

        exp.ExpenseHeadId = dto.ExpenseHeadId ?? exp.ExpenseHeadId;
        exp.ProjectId = dto.ProjectId ?? exp.ProjectId;
        exp.Amount = dto.Amount ?? exp.Amount;
        exp.Description = dto.Description ?? exp.Description;
        exp.ExpenseDate = dto.ExpenseDate ?? exp.ExpenseDate;
        exp.Status = dto.Status ?? exp.Status;
        exp.ReceiptUrl = dto.ReceiptUrl ?? exp.ReceiptUrl;
        exp.UpdatedAt = DateTime.UtcNow;
        exp.UpdatedBy = userId;

        await _context.SaveChangesAsync();
        return new ExpenseResponseDto(exp.Id, exp.ExpenseHeadId, exp.ExpenseHead?.Name ?? "", exp.ProjectId, exp.Project?.Name, exp.Amount, exp.Description, exp.ExpenseDate, exp.SpentById, exp.SpentBy?.Username, exp.Status, exp.ApprovedById, exp.ApprovedDate, exp.ReceiptUrl, exp.CreatedAt);
    }

    public async Task<bool> DeleteAsync(string id, string tenantId)
    {
        var exp = await _context.Expenses.FirstOrDefaultAsync(e => e.Id == id && e.TenantId == tenantId);
        if (exp == null) return false;
        _context.Expenses.Remove(exp);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ApproveAsync(string id, string tenantId, string userId)
    {
        var exp = await _context.Expenses.FirstOrDefaultAsync(e => e.Id == id && e.TenantId == tenantId);
        if (exp == null) return false;
        exp.Status = "Approved";
        exp.ApprovedById = userId;
        exp.ApprovedDate = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return true;
    }
}
