using CleanArchitectureApp.Application.DTOs;
using CleanArchitectureApp.Application.Interfaces;
using CleanArchitectureApp.Domain.Entities;
using CleanArchitectureApp.Infrastructure.Data;
using CleanArchitectureApp.Infrastructure.Helpers;
using Microsoft.EntityFrameworkCore;

namespace CleanArchitectureApp.Infrastructure.Services;

public class InvoiceService : IInvoiceService
{
    private readonly AppDbContext _context;

    public InvoiceService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<InvoiceResponseDto>> GetAllAsync(string tenantId)
    {
        var invoices = await _context.Invoices.Where(i => i.TenantId == tenantId).ToListAsync();
        return invoices.Select(MapToResponseDto);
    }

    public async Task<InvoiceResponseDto?> GetByIdAsync(string id, string tenantId)
    {
        var inv = await _context.Invoices.Include(i => i.Items).FirstOrDefaultAsync(i => i.Id == id && i.TenantId == tenantId);
        return inv == null ? null : MapToResponseDto(inv);
    }

    public async Task<IEnumerable<InvoiceResponseDto>> GetByProjectAsync(string projectId, string tenantId)
    {
        var invoices = await _context.Invoices.Where(i => i.ProjectId == projectId && i.TenantId == tenantId).ToListAsync();
        return invoices.Select(MapToResponseDto);
    }

    public async Task<InvoiceResponseDto> CreateAsync(CreateInvoiceDto dto, string tenantId, string userId)
    {
        var inv = new Invoice
        {
            Id = UlidGenerator.Generate(),
            ClientId = dto.ClientId,
            ProjectId = dto.ProjectId,
            InvoiceNumber = dto.InvoiceNumber,
            InvoiceDate = dto.InvoiceDate,
            SubTotal = dto.SubTotal,
            TaxAmount = dto.TaxAmount ?? 0,
            RetentionAmount = dto.RetentionAmount,
            TDSAmount = dto.TDSAmount,
            Notes = dto.Notes,
            TenantId = tenantId,
            CreatedBy = userId,
            CreatedAt = DateTime.UtcNow,
            Status = "Draft"
        };

        _context.Invoices.Add(inv);
        await _context.SaveChangesAsync();
        return MapToResponseDto(inv);
    }

    public async Task<InvoiceResponseDto?> UpdateAsync(string id, UpdateInvoiceDto dto, string tenantId, string userId)
    {
        var inv = await _context.Invoices.FirstOrDefaultAsync(i => i.Id == id && i.TenantId == tenantId);
        if (inv == null) return null;

        inv.InvoiceNumber = dto.InvoiceNumber ?? inv.InvoiceNumber;
        inv.InvoiceDate = dto.InvoiceDate ?? inv.InvoiceDate;
        inv.SubTotal = dto.SubTotal ?? inv.SubTotal;
        inv.TaxAmount = dto.TaxAmount ?? inv.TaxAmount;
        inv.RetentionAmount = dto.RetentionAmount ?? inv.RetentionAmount;
        inv.TDSAmount = dto.TDSAmount ?? inv.TDSAmount;
        inv.Status = dto.Status ?? inv.Status;
        inv.Notes = dto.Notes ?? inv.Notes;
        inv.UpdatedAt = DateTime.UtcNow;
        inv.UpdatedBy = userId;

        await _context.SaveChangesAsync();
        return MapToResponseDto(inv);
    }

    public async Task<bool> DeleteAsync(string id, string tenantId)
    {
        var inv = await _context.Invoices.FirstOrDefaultAsync(i => i.Id == id && i.TenantId == tenantId);
        if (inv == null) return false;
        _context.Invoices.Remove(inv);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<IEnumerable<InvoiceItemResponseDto>> GetItemsAsync(string invoiceId, string tenantId)
    {
        var items = await _context.InvoiceItems.Where(it => it.InvoiceId == invoiceId && it.TenantId == tenantId).ToListAsync();
        return items.Select(it => new InvoiceItemResponseDto(it.Id, it.InvoiceId, it.ItemId, null, it.Quantity, it.Rate, it.TaxPercentage, it.TaxAmount, it.Amount, it.TotalAmount));
    }

    public async Task<InvoiceItemResponseDto> AddItemAsync(string invoiceId, CreateInvoiceItemDto dto, string tenantId)
    {
        var inv = await _context.Invoices.FirstOrDefaultAsync(i => i.Id == invoiceId && i.TenantId == tenantId);
        if (inv == null) throw new Exception("Invoice not found");

        var it = new InvoiceItem
        {
            Id = UlidGenerator.Generate(),
            InvoiceId = invoiceId,
            ItemId = dto.ItemId,
            Quantity = dto.Quantity,
            Rate = dto.Rate,
            TaxPercentage = dto.TaxPercentage,
            TaxAmount = dto.Quantity * dto.Rate * dto.TaxPercentage / 100,
            Amount = dto.Quantity * dto.Rate,
            TotalAmount = dto.Quantity * dto.Rate + (dto.Quantity * dto.Rate * dto.TaxPercentage / 100),
            TenantId = tenantId,
            CreatedAt = DateTime.UtcNow
        };

        _context.InvoiceItems.Add(it);
        await _context.SaveChangesAsync();

        return new InvoiceItemResponseDto(it.Id, it.InvoiceId, it.ItemId, null, it.Quantity, it.Rate, it.TaxPercentage, it.TaxAmount, it.Amount, it.TotalAmount);
    }

    public async Task<bool> RemoveItemAsync(string itemId, string tenantId)
    {
        var it = await _context.InvoiceItems.FirstOrDefaultAsync(i => i.Id == itemId && i.TenantId == tenantId);
        if (it == null) return false;
        _context.InvoiceItems.Remove(it);
        await _context.SaveChangesAsync();
        return true;
    }

    private static InvoiceResponseDto MapToResponseDto(Invoice inv)
    {
        return new InvoiceResponseDto(inv.Id, inv.ClientId, null, inv.ProjectId, null, inv.InvoiceNumber, inv.InvoiceDate, inv.SubTotal, inv.TaxAmount, inv.RetentionAmount, inv.TDSAmount, inv.GrandTotal, inv.Status, inv.Notes, inv.CreatedAt, inv.UpdatedAt);
    }
}
