using System;
using CleanArchitectureApp.Application.DTOs;
using CleanArchitectureApp.Application.Interfaces;
using CleanArchitectureApp.Domain.Entities;
using CleanArchitectureApp.Infrastructure.Data;
using CleanArchitectureApp.Infrastructure.Helpers;
using Microsoft.EntityFrameworkCore;

namespace CleanArchitectureApp.Infrastructure.Services;

public class InventoryService : IInventoryService
{
    private readonly AppDbContext _context;

    public InventoryService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<InventoryResponseDto>> GetStockBySiteAsync(string siteId, string tenantId)
    {
        var inventories = await _context.Inventories.Where(i => /* sites not implemented */ i.TenantId == tenantId).ToListAsync();
        return inventories.Select(i => new InventoryResponseDto(i.Id, i.ItemId, "", "", "", i.Quantity, i.ReorderLevel, i.AverageRate, i.TotalValue, i.LastUpdated));
    }

    public async Task<InventoryResponseDto?> GetItemStockAsync(string siteId, string itemId, string tenantId)
    {
        var inv = await _context.Inventories.FirstOrDefaultAsync(i => i.ItemId == itemId && i.TenantId == tenantId);
        if (inv == null) return null;
        return new InventoryResponseDto(inv.Id, inv.ItemId, "", "", "", inv.Quantity, inv.ReorderLevel, inv.AverageRate, inv.TotalValue, inv.LastUpdated);
    }

    public async Task<TransactionResponseDto> ProcessTransactionAsync(CreateTransactionDto dto, string tenantId, string userId)
    {
        var inv = await _context.Inventories.FirstOrDefaultAsync(i => i.ItemId == dto.ItemId && i.TenantId == tenantId);
        if (inv == null) throw new InvalidOperationException("Inventory record not found");

        if (dto.TransactionType == "Issue")
        {
            if (inv.Quantity < dto.Quantity) throw new InvalidOperationException("Insufficient quantity");
            inv.Quantity -= dto.Quantity;
        }
        else
        {
            inv.Quantity += dto.Quantity;
        }

        inv.LastUpdated = DateTime.UtcNow;
        inv.LastUpdatedBy = userId;

        var mt = new MaterialTransaction
        {
            Id = UlidGenerator.Generate(),
            ItemId = dto.ItemId,
            TransactionType = dto.TransactionType,
            ReferenceType = dto.ReferenceType,
            ReferenceId = dto.ReferenceId,
            Quantity = dto.Quantity,
            Unit = dto.Unit,
            Rate = dto.Rate,
            Remarks = dto.Remarks,
            TransactionDate = DateTime.UtcNow,
            TenantId = tenantId,
            CreatedBy = userId,
            CreatedAt = DateTime.UtcNow
        };

        _context.MaterialTransactions.Add(mt);
        await _context.SaveChangesAsync();

        return new TransactionResponseDto(
            mt.Id,
            mt.TransactionDate,
            mt.TransactionType,
            mt.ReferenceType,
            mt.ReferenceId,
            mt.ItemId,
            mt.Item?.Name ?? string.Empty,
            mt.Quantity,
            mt.Unit,
            mt.Rate,
            mt.Amount,
            mt.ProjectId,
            null,
            mt.Remarks,
            mt.CreatedBy
        );
    }

    public async Task<IEnumerable<TransactionResponseDto>> GetTransactionsBySiteAsync(string siteId, string tenantId)
    {
        var tx = await _context.MaterialTransactions.Where(t => t.TenantId == tenantId).ToListAsync();
        return tx.Select(t => new TransactionResponseDto(
            t.Id,
            t.TransactionDate,
            t.TransactionType,
            t.ReferenceType,
            t.ReferenceId,
            t.ItemId,
            t.Item?.Name ?? string.Empty,
            t.Quantity,
            t.Unit,
            t.Rate,
            t.Amount,
            t.ProjectId,
            null,
            t.Remarks,
            t.CreatedBy
        ));
    }
}
