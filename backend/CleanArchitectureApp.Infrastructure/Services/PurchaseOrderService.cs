using CleanArchitectureApp.Application.DTOs;
using CleanArchitectureApp.Application.Interfaces;
using CleanArchitectureApp.Domain.Entities;
using CleanArchitectureApp.Infrastructure.Data;
using CleanArchitectureApp.Infrastructure.Helpers;
using Microsoft.EntityFrameworkCore;

namespace CleanArchitectureApp.Infrastructure.Services;

public class PurchaseOrderService : IPurchaseOrderService
{
    private readonly AppDbContext _context;

    public PurchaseOrderService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<PurchaseOrderResponseDto>> GetAllAsync(string tenantId)
    {
        var pos = await _context.PurchaseOrders.Where(p => p.TenantId == tenantId).ToListAsync();
        return pos.Select(p => new PurchaseOrderResponseDto(p.Id, p.PONumber, p.VendorId, null, p.ProjectId, null, p.CreatedAt, p.ExpectedDeliveryDate, p.SubTotal, p.TaxAmount, p.DiscountAmount, p.GrandTotal, p.Status, p.PaymentTerms, p.DeliveryTerms, p.Notes, p.IsActive, p.Items.Select(i => new PurchaseOrderItemResponseDto(i.Id, i.PurchaseOrderId, i.ItemId, null, null, i.Quantity, i.Rate, i.Unit, i.GSTPercentage, i.GSTAmount, i.Amount, i.TotalAmount, i.ReceivedQuantity, i.PendingQuantity)).ToList(), p.CreatedAt, p.UpdatedAt));
    }

    public async Task<IEnumerable<PurchaseOrderResponseDto>> GetByProjectAsync(string projectId, string tenantId)
    {
        var pid = projectId.ToString();
        var pos = await _context.PurchaseOrders.Where(p => p.ProjectId == pid && p.TenantId == tenantId).ToListAsync();
        return pos.Select(p => new PurchaseOrderResponseDto(p.Id, p.PONumber, p.VendorId, null, p.ProjectId, null, p.CreatedAt, p.ExpectedDeliveryDate, p.SubTotal, p.TaxAmount, p.DiscountAmount, p.GrandTotal, p.Status, p.PaymentTerms, p.DeliveryTerms, p.Notes, p.IsActive, p.Items.Select(i => new PurchaseOrderItemResponseDto(i.Id, i.PurchaseOrderId, i.ItemId, null, null, i.Quantity, i.Rate, i.Unit, i.GSTPercentage, i.GSTAmount, i.Amount, i.TotalAmount, i.ReceivedQuantity, i.PendingQuantity)).ToList(), p.CreatedAt, p.UpdatedAt));
    }

    public async Task<PurchaseOrderResponseDto?> GetByIdAsync(string id, string tenantId)
    {
        var po = await _context.PurchaseOrders.Include(p => p.Items).FirstOrDefaultAsync(p => p.Id == id && p.TenantId == tenantId);
        if (po == null) return null;
        return new PurchaseOrderResponseDto(po.Id, po.PONumber, po.VendorId, null, po.ProjectId, null, po.CreatedAt, po.ExpectedDeliveryDate, po.SubTotal, po.TaxAmount, po.DiscountAmount, po.GrandTotal, po.Status, po.PaymentTerms, po.DeliveryTerms, po.Notes, po.IsActive, po.Items.Select(i => new PurchaseOrderItemResponseDto(i.Id, i.PurchaseOrderId, i.ItemId, null, null, i.Quantity, i.Rate, i.Unit, i.GSTPercentage, i.GSTAmount, i.Amount, i.TotalAmount, i.ReceivedQuantity, i.PendingQuantity)).ToList(), po.CreatedAt, po.UpdatedAt);
    }

    public async Task<PurchaseOrderResponseDto> CreateAsync(CreatePurchaseOrderDto dto, string tenantId, string userId)
    {
        var po = new PurchaseOrder
        {
            Id = UlidGenerator.Generate(),
            PONumber = dto.PONumber,
            VendorId = dto.VendorId,
            ProjectId = dto.ProjectId,
            ExpectedDeliveryDate = dto.ExpectedDeliveryDate,
            PaymentTerms = dto.PaymentTerms,
            DeliveryTerms = dto.DeliveryTerms,
            Notes = dto.Notes,
            TenantId = tenantId,
            CreatedBy = userId,
            CreatedAt = DateTime.UtcNow,
            Status = "Draft",
            IsActive = true
        };

        if (dto.Items != null)
        {
            foreach (var it in dto.Items)
            {
                po.Items.Add(new PurchaseOrderItem
                {
                    Id = UlidGenerator.Generate(),
                    PurchaseOrderId = po.Id,
                    ItemId = it.ItemId,
                    Quantity = it.Quantity,
                    Unit = it.Unit,
                    Rate = it.Rate,
                    GSTPercentage = it.GSTPercentage,
                    Amount = it.Quantity * it.Rate,
                    TotalAmount = it.Quantity * it.Rate // Taxes ignored for brevity
                });
            }
        }

        _context.PurchaseOrders.Add(po);
        await _context.SaveChangesAsync();

        return await GetByIdAsync(po.Id, tenantId) ?? throw new Exception("Failed to create PO");
    }

    public async Task<PurchaseOrderResponseDto?> UpdateAsync(string id, UpdatePurchaseOrderDto dto, string tenantId, string userId)
    {
        var po = await _context.PurchaseOrders.FirstOrDefaultAsync(p => p.Id == id && p.TenantId == tenantId);
        if (po == null) return null;
        po.Status = dto.Status ?? po.Status;
        po.PaymentTerms = dto.PaymentTerms ?? po.PaymentTerms;
        po.DeliveryTerms = dto.DeliveryTerms ?? po.DeliveryTerms;
        po.Notes = dto.Notes ?? po.Notes;
        po.IsActive = dto.IsActive ?? po.IsActive;
        po.UpdatedAt = DateTime.UtcNow;
        po.UpdatedBy = userId;
        await _context.SaveChangesAsync();
        return await GetByIdAsync(po.Id, tenantId);
    }

    public async Task<bool> DeleteAsync(string id, string tenantId)
    {
        var po = await _context.PurchaseOrders.FirstOrDefaultAsync(p => p.Id == id && p.TenantId == tenantId);
        if (po == null) return false;
        _context.PurchaseOrders.Remove(po);
        await _context.SaveChangesAsync();
        return true;
    }
}
