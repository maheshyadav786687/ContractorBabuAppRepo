using CleanArchitectureApp.Application.DTOs;
using CleanArchitectureApp.Application.Interfaces;
using CleanArchitectureApp.Domain.Entities;
using CleanArchitectureApp.Infrastructure.Data;
using CleanArchitectureApp.Infrastructure.Helpers;
using Microsoft.EntityFrameworkCore;

namespace CleanArchitectureApp.Infrastructure.Services;

public class SiteService : ISiteService
{
    private readonly AppDbContext _context;

    public SiteService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<SiteDto>> GetAllSitesAsync(string tenantId)
    {
        var sites = await _context.Sites
            .Include(s => s.Client)
            .Where(s => s.TenantId == tenantId && s.IsActive)
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync();

        return sites.Select(MapToDto);
    }

    public async Task<SiteDto?> GetSiteByIdAsync(string id, string tenantId)
    {
        var site = await _context.Sites
            .Include(s => s.Client)
            .FirstOrDefaultAsync(s => s.Id == id && s.TenantId == tenantId);

        return site == null ? null : MapToDto(site);
    }

    public async Task<IEnumerable<SiteDto>> GetSitesByClientIdAsync(string clientId, string tenantId)
    {
        var sites = await _context.Sites
            .Include(s => s.Client)
            .Where(s => s.ClientId == clientId && s.TenantId == tenantId && s.IsActive)
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync();

        return sites.Select(MapToDto);
    }

    public async Task<SiteDto> CreateSiteAsync(CreateSiteDto createSiteDto, string tenantId, string userId)
    {
        // Verify client exists and belongs to tenant
        var client = await _context.Clients
            .FirstOrDefaultAsync(c => c.Id == createSiteDto.ClientId && c.TenantId == tenantId);

        if (client == null)
        {
            throw new ArgumentException("Client not found or does not belong to the current tenant");
        }

        var site = new Site
        {
            Id = UlidGenerator.Generate(),
            Name = createSiteDto.Name,
            Address = createSiteDto.Address,
            City = createSiteDto.City,
            State = createSiteDto.State,
            ZipCode = createSiteDto.ZipCode,
            ClientId = createSiteDto.ClientId,
            TenantId = tenantId!,
            CreatedBy = userId,
            IsActive = true
        };

        _context.Sites.Add(site);
        await _context.SaveChangesAsync();
        
        // Reload to get included properties if needed, or just map manually
        // We have the client object already
        site.Client = client;

        return MapToDto(site);
    }

    public async Task<SiteDto?> UpdateSiteAsync(string id, UpdateSiteDto updateSiteDto, string tenantId, string userId)
    {
        var site = await _context.Sites
            .Include(s => s.Client)
            .FirstOrDefaultAsync(s => s.Id == id && s.TenantId == tenantId);

        if (site == null) return null;

        if (updateSiteDto.Name != null) site.Name = updateSiteDto.Name;
        if (updateSiteDto.Address != null) site.Address = updateSiteDto.Address;
        if (updateSiteDto.City != null) site.City = updateSiteDto.City;
        if (updateSiteDto.State != null) site.State = updateSiteDto.State;
        if (updateSiteDto.ZipCode != null) site.ZipCode = updateSiteDto.ZipCode;
        if (updateSiteDto.IsActive.HasValue) site.IsActive = updateSiteDto.IsActive.Value;

        site.UpdatedAt = DateTime.UtcNow;
        site.UpdatedBy = userId;

        await _context.SaveChangesAsync();

        return MapToDto(site);
    }

    public async Task<bool> DeleteSiteAsync(string id, string tenantId)
    {
        var site = await _context.Sites
            .FirstOrDefaultAsync(s => s.Id == id && s.TenantId == tenantId);

        if (site == null) return false;

        // Soft delete
        site.IsActive = false;
        await _context.SaveChangesAsync();

        return true;
    }

    private static SiteDto MapToDto(Site site)
    {
        return new SiteDto
        {
            Id = site.Id,
            Name = site.Name,
            Address = site.Address,
            City = site.City,
            State = site.State,
            ZipCode = site.ZipCode,
            ClientId = site.ClientId,
            ClientName = site.Client?.Name ?? string.Empty,
            CreatedAt = site.CreatedAt,
            IsActive = site.IsActive
        };
    }
}
