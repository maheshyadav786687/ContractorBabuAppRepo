using CleanArchitectureApp.Application.DTOs;
using CleanArchitectureApp.Application.Interfaces;
using CleanArchitectureApp.Domain.Entities;
using CleanArchitectureApp.Infrastructure.Data;
using CleanArchitectureApp.Infrastructure.Helpers;
using Microsoft.EntityFrameworkCore;

namespace CleanArchitectureApp.Infrastructure.Services;

public class ItemService : IItemService
{
    private readonly AppDbContext _context;

    public ItemService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<ItemResponseDto>> GetAllAsync(string tenantId)
    {
        var items = await _context.Items.Where(i => i.TenantId == tenantId).ToListAsync();
        return items.Select(MapToResponseDto);
    }

    public async Task<ItemResponseDto?> GetByIdAsync(string id, string tenantId)
    {
        var item = await _context.Items.FirstOrDefaultAsync(i => i.Id == id && i.TenantId == tenantId);
        return item == null ? null : MapToResponseDto(item);
    }

    public async Task<ItemResponseDto> CreateAsync(CreateItemDto dto, string tenantId, string userId)
    {
        var item = new Item
        {
            Id = UlidGenerator.Generate(),
            Code = dto.Code,
            Name = dto.Name,
            Description = dto.Description,
            Category = dto.Category,
            SubCategory = dto.SubCategory,
            Unit = dto.Unit,
            StandardRate = dto.StandardRate,
            MinRate = dto.MinRate,
            MaxRate = dto.MaxRate,
            GSTPercentage = dto.GSTPercentage,
            HSNCode = dto.HSNCode,
            Brand = dto.Brand,
            Specifications = dto.Specifications,
            TenantId = tenantId,
            CreatedBy = userId,
            CreatedAt = DateTime.UtcNow,
            IsActive = true
        };

        _context.Items.Add(item);
        await _context.SaveChangesAsync();

        return MapToResponseDto(item);
    }

    public async Task<ItemResponseDto?> UpdateAsync(string id, UpdateItemDto dto, string tenantId, string userId)
    {
        var item = await _context.Items.FirstOrDefaultAsync(i => i.Id == id && i.TenantId == tenantId);
        if (item == null) return null;

        item.Name = dto.Name ?? item.Name;
        item.Description = dto.Description ?? item.Description;
        item.Category = dto.Category ?? item.Category;
        item.SubCategory = dto.SubCategory ?? item.SubCategory;
        item.Unit = dto.Unit ?? item.Unit;
        item.StandardRate = dto.StandardRate ?? item.StandardRate;
        item.MinRate = dto.MinRate ?? item.MinRate;
        item.MaxRate = dto.MaxRate ?? item.MaxRate;
        item.GSTPercentage = dto.GSTPercentage ?? item.GSTPercentage;
        item.HSNCode = dto.HSNCode ?? item.HSNCode;
        item.Brand = dto.Brand ?? item.Brand;
        item.Specifications = dto.Specifications ?? item.Specifications;
        item.IsActive = dto.IsActive ?? item.IsActive;
        item.UpdatedBy = userId;
        item.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return MapToResponseDto(item);
    }

    public async Task<bool> DeleteAsync(string id, string tenantId)
    {
        var item = await _context.Items.FirstOrDefaultAsync(i => i.Id == id && i.TenantId == tenantId);
        if (item == null) return false;
        _context.Items.Remove(item);
        await _context.SaveChangesAsync();
        return true;
    }

    private static ItemResponseDto MapToResponseDto(Item item)
    {
        return new ItemResponseDto(
            item.Id,
            item.Code,
            item.Name,
            item.Description,
            item.Category,
            item.SubCategory,
            item.Unit,
            item.StandardRate,
            item.MinRate,
            item.MaxRate,
            item.GSTPercentage,
            item.HSNCode,
            item.Brand,
            item.Specifications,
            item.IsActive,
            item.CreatedAt,
            item.UpdatedAt
        );
    }
}
