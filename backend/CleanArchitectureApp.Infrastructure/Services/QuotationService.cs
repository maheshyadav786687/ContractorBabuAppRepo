using CleanArchitectureApp.Application.DTOs;
using CleanArchitectureApp.Application.Interfaces;
using CleanArchitectureApp.Domain.Entities;
using CleanArchitectureApp.Infrastructure.Data;
using CleanArchitectureApp.Infrastructure.Helpers;
using Microsoft.EntityFrameworkCore;

namespace CleanArchitectureApp.Infrastructure.Services;

public class QuotationService : IQuotationService
{
    private readonly AppDbContext _context;

    public QuotationService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<string> GetNextQuotationNumberAsync(string tenantId)
    {
        var count = await _context.Quotations.CountAsync(q => q.TenantId == tenantId);
        var year = DateTime.UtcNow.Year;
        return $"QT-{year}-{(count + 1):D4}";
    }

        public async Task<IEnumerable<QuotationResponseDto>> GetAllAsync(string tenantId)
    {
        var quotations = await _context.Quotations
            .Include(q => q.Project)
                .ThenInclude(p => p.Client)
            .Include(q => q.Items)
            .Where(q => q.TenantId == tenantId)
            .ToListAsync();
        return quotations.Select(MapToResponseDto);
    }

    public async Task<IEnumerable<QuotationResponseDto>> GetByProjectAsync(string projectId, string tenantId)
    {
        var quotations = await _context.Quotations
            .Include(q => q.Project)
                .ThenInclude(p => p.Client)
            .Include(q => q.Items)
            .Where(q => q.ProjectId == projectId && q.TenantId == tenantId)
            .ToListAsync();
        return quotations.Select(MapToResponseDto);
    }

    public async Task<QuotationResponseDto?> GetByIdAsync(string id, string tenantId)
    {
        var quotation = await _context.Quotations
            .Include(q => q.Project)
                .ThenInclude(p => p.Client)
            .Include(q => q.Items)
            .FirstOrDefaultAsync(q => q.Id == id && q.TenantId == tenantId);
        return quotation == null ? null : MapToResponseDto(quotation);
    }

    public async Task<QuotationResponseDto> CreateAsync(CreateQuotationDto dto, string tenantId, string userId)
    {
        // Auto-generate Quotation Number
        var count = await _context.Quotations.CountAsync(q => q.TenantId == tenantId);
        var year = DateTime.UtcNow.Year;
        var quotationNumber = $"QT-{year}-{(count + 1):D4}";

        var quotation = new Quotation
        {
            Id = UlidGenerator.Generate(),
            QuotationNumber = quotationNumber,
            ProjectId = dto.ProjectId,
            SiteId = dto.SiteId,
            Description = dto.Description,
            Remarks = dto.Remarks,
            QuotationDate = dto.QuotationDate ?? DateTime.UtcNow,
            TaxPercentage = dto.TaxPercentage,
            DiscountPercentage = dto.DiscountPercentage,
            TenantId = tenantId,
            CreatedAt = DateTime.UtcNow,
            IsActive = true
        };

        decimal subTotal = 0;

        // Add items
        if (dto.Items != null)
        {
            foreach (var it in dto.Items)
            {
                var qi = new QuotationItem
                {
                    Id = UlidGenerator.Generate(),
                    QuotationId = quotation.Id,
                    Description = it.Description,
                    Quantity = it.Quantity,
                    Area = it.Area,
                    Length = it.Length,
                    Width = it.Width,
                    Height = it.Height,
                    Unit = it.Unit,
                    Rate = it.Rate,
                    Amount = it.Amount,
                    IsWithMaterial = it.IsWithMaterial,
                    Sequence = it.Sequence,
                    TenantId = tenantId,
                    CreatedAt = DateTime.UtcNow
                };
                quotation.Items.Add(qi);
                subTotal += qi.Amount;
            }
        }

        quotation.SubTotal = subTotal;
        quotation.TaxAmount = subTotal * (quotation.TaxPercentage / 100);
        quotation.DiscountAmount = subTotal * (quotation.DiscountPercentage / 100); // Assuming discount on subtotal
        quotation.GrandTotal = subTotal + quotation.TaxAmount - quotation.DiscountAmount;

        _context.Quotations.Add(quotation);
        await _context.SaveChangesAsync();
        return MapToResponseDto(quotation);
    }

    public async Task<QuotationResponseDto?> UpdateAsync(string id, UpdateQuotationDto dto, string tenantId, string userId)
    {
        var quotation = await _context.Quotations.Include(q => q.Items).FirstOrDefaultAsync(q => q.Id == id && q.TenantId == tenantId);
        if (quotation == null) return null;

        quotation.Description = dto.Description ?? quotation.Description;
        quotation.Remarks = dto.Remarks ?? quotation.Remarks;
        quotation.QuotationDate = dto.QuotationDate ?? quotation.QuotationDate;
        quotation.Status = dto.Status ?? quotation.Status;
        quotation.IsActive = dto.IsActive ?? quotation.IsActive;
        
        if (dto.TaxPercentage.HasValue) quotation.TaxPercentage = dto.TaxPercentage.Value;
        if (dto.DiscountPercentage.HasValue) quotation.DiscountPercentage = dto.DiscountPercentage.Value;

        // Recalculate totals
        decimal subTotal = quotation.Items.Sum(i => i.Amount);
        quotation.SubTotal = subTotal;
        quotation.TaxAmount = subTotal * (quotation.TaxPercentage / 100);
        quotation.DiscountAmount = subTotal * (quotation.DiscountPercentage / 100);
        quotation.GrandTotal = subTotal + quotation.TaxAmount - quotation.DiscountAmount;

        await _context.SaveChangesAsync();
        return MapToResponseDto(quotation);
    }

    public async Task<bool> DeleteAsync(string id, string tenantId)
    {
        var quotation = await _context.Quotations.FirstOrDefaultAsync(q => q.Id == id && q.TenantId == tenantId);
        if (quotation == null) return false;
        _context.Quotations.Remove(quotation);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<QuotationItemResponseDto> AddItemAsync(string quotationId, CreateQuotationItemDto dto, string tenantId, string userId)
    {
        var quotation = await _context.Quotations.Include(q => q.Items).FirstOrDefaultAsync(q => q.Id == quotationId && q.TenantId == tenantId);
        if (quotation == null) throw new Exception("Quotation not found");

        var qi = new QuotationItem
        {
            Id = UlidGenerator.Generate(),
            QuotationId = quotationId,
            Description = dto.Description,
            Quantity = dto.Quantity,
            Area = dto.Area,
            Length = dto.Length,
            Width = dto.Width,
            Height = dto.Height,
            Unit = dto.Unit,
            Rate = dto.Rate,
            Amount = dto.Amount,
            IsWithMaterial = dto.IsWithMaterial,
            Sequence = dto.Sequence,
            TenantId = tenantId,
            CreatedAt = DateTime.UtcNow
        };

        quotation.Items.Add(qi); // Add to collection to recalculate
        _context.QuotationItems.Add(qi);

        // Recalculate Quotation Totals
        decimal subTotal = quotation.Items.Sum(i => i.Amount);
        quotation.SubTotal = subTotal;
        quotation.TaxAmount = subTotal * (quotation.TaxPercentage / 100);
        quotation.DiscountAmount = subTotal * (quotation.DiscountPercentage / 100);
        quotation.GrandTotal = subTotal + quotation.TaxAmount - quotation.DiscountAmount;

        await _context.SaveChangesAsync();

        return new QuotationItemResponseDto(qi.Id, qi.QuotationId, qi.Description, qi.Quantity, qi.Area, qi.Length, qi.Width, qi.Height, qi.Unit, qi.Rate, qi.Amount, qi.IsWithMaterial, qi.Sequence);
    }

    public async Task<QuotationItemResponseDto?> UpdateItemAsync(string itemId, UpdateQuotationItemDto dto, string tenantId, string userId)
    {
        var qi = await _context.QuotationItems.FirstOrDefaultAsync(i => i.Id == itemId && i.TenantId == tenantId);
        if (qi == null) return null;

        qi.Description = dto.Description ?? qi.Description;
        qi.Quantity = dto.Quantity ?? qi.Quantity;
    qi.Area = dto.Area ?? qi.Area;
    qi.Length = dto.Length ?? qi.Length;
    qi.Width = dto.Width ?? qi.Width;
    qi.Height = dto.Height ?? qi.Height;
        qi.Unit = dto.Unit ?? qi.Unit;
        qi.Rate = dto.Rate ?? qi.Rate;
        qi.Amount = dto.Amount ?? qi.Amount;
        qi.IsWithMaterial = dto.IsWithMaterial ?? qi.IsWithMaterial;
        qi.Sequence = dto.Sequence ?? qi.Sequence;
        
        // Recalculate Quotation Totals
        var quotation = await _context.Quotations.Include(q => q.Items).FirstOrDefaultAsync(q => q.Id == qi.QuotationId && q.TenantId == tenantId);
        if (quotation != null)
        {
             // Verify if current item is updated in memory automatically or need to be explicit.
             // EF Core tracks changes, so quotation.Items should have the updated item if it was loaded.
             // But we didn't load items for this QI yet.
             // Since we loaded quotation with Include Items, it should include the QI we just modified (same context).
             
             decimal subTotal = quotation.Items.Sum(i => i.Amount);
             quotation.SubTotal = subTotal;
             quotation.TaxAmount = subTotal * (quotation.TaxPercentage / 100);
             quotation.DiscountAmount = subTotal * (quotation.DiscountPercentage / 100);
             quotation.GrandTotal = subTotal + quotation.TaxAmount - quotation.DiscountAmount;
        }

        await _context.SaveChangesAsync();

        return new QuotationItemResponseDto(qi.Id, qi.QuotationId, qi.Description, qi.Quantity, qi.Area, qi.Length, qi.Width, qi.Height, qi.Unit, qi.Rate, qi.Amount, qi.IsWithMaterial, qi.Sequence);
    }

    public async Task<bool> RemoveItemAsync(string itemId, string tenantId)
    {
        var qi = await _context.QuotationItems.FirstOrDefaultAsync(i => i.Id == itemId && i.TenantId == tenantId);
        if (qi == null) return false;
        
        var quotationId = qi.QuotationId;
        _context.QuotationItems.Remove(qi);
        
        // Recalculate
        var quotation = await _context.Quotations.Include(q => q.Items).FirstOrDefaultAsync(q => q.Id == quotationId && q.TenantId == tenantId);
        if (quotation != null)
        {
             // The item is marked for deletion but might still be in the collection? 
             // We should exclude it.
             decimal subTotal = quotation.Items.Where(i => i.Id != itemId).Sum(i => i.Amount);
             quotation.SubTotal = subTotal;
             quotation.TaxAmount = subTotal * (quotation.TaxPercentage / 100);
             quotation.DiscountAmount = subTotal * (quotation.DiscountPercentage / 100);
             quotation.GrandTotal = subTotal + quotation.TaxAmount - quotation.DiscountAmount;
        }
        
        await _context.SaveChangesAsync();
        return true;
    }

    private static QuotationResponseDto MapToResponseDto(Quotation q)
    {
        return new QuotationResponseDto(
            q.Id,
            q.QuotationNumber,
            q.ProjectId,
            q.Project?.Name,
            q.SiteId,
            q.Site?.Name,
            q.Description,
            q.Remarks,
            q.QuotationDate,
            q.Status,
            q.SubTotal,
            q.TaxPercentage,
            q.TaxAmount,
            q.DiscountPercentage,
            q.DiscountAmount,
            q.GrandTotal,
            q.IsActive,
            q.Project?.Client?.Name,
            q.Project?.Client?.Email,
            q.Project?.Client?.Phone,
            q.Project?.Client?.Address,
            q.Items.Select(i => new QuotationItemResponseDto(i.Id, i.QuotationId, i.Description, i.Quantity, i.Area, i.Length, i.Width, i.Height, i.Unit, i.Rate, i.Amount, i.IsWithMaterial, i.Sequence)).ToList(),
            q.CreatedAt
        );
    }
}