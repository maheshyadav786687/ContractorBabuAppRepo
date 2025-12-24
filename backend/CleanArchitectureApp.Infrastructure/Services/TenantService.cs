using CleanArchitectureApp.Application.DTOs;
using CleanArchitectureApp.Application.Interfaces;
using CleanArchitectureApp.Domain.Entities;
using CleanArchitectureApp.Infrastructure.Data;
using CleanArchitectureApp.Infrastructure.Helpers;
using Microsoft.EntityFrameworkCore;

namespace CleanArchitectureApp.Infrastructure.Services;

public class TenantService : ITenantService
{
    private readonly AppDbContext _context;

    public TenantService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<TenantResponseDto?> GetTenantByIdAsync(string tenantId)
    {
        var tenant = await _context.Tenants
            .Include(t => t.Users)
            .FirstOrDefaultAsync(t => t.Id == tenantId);

        if (tenant == null) return null;

        return MapToResponseDto(tenant);
    }

    public async Task<IEnumerable<TenantResponseDto>> GetAllTenantsAsync()
    {
        var tenants = await _context.Tenants
            .Include(t => t.Users)
            .ToListAsync();

        return tenants.Select(MapToResponseDto);
    }

    public async Task<TenantResponseDto> CreateTenantAsync(CreateTenantDto dto)
    {
        // Check if company code already exists
        if (!string.IsNullOrEmpty(dto.CompanyCode))
        {
            var exists = await _context.Tenants.AnyAsync(t => t.CompanyCode == dto.CompanyCode);
            if (exists)
            {
                throw new Exception("Company code already exists");
            }
        }

        var tenant = new Tenant
        {
            Id = UlidGenerator.Generate(),
            CompanyName = dto.CompanyName,
            CompanyCode = dto.CompanyCode ?? GenerateCompanyCode(dto.CompanyName),
            Email = dto.Email,
            Phone = dto.Phone,
            Address = dto.Address,
            City = dto.City,
            State = dto.State,
            GSTNumber = dto.GSTNumber,
            PANNumber = dto.PANNumber,
            SubscriptionPlan = dto.SubscriptionPlan,
            SubscriptionStartDate = DateTime.UtcNow,
            SubscriptionEndDate = DateTime.UtcNow.AddMonths(dto.SubscriptionPlan == "Free" ? 1 : 12),
            IsActive = true,
            MaxUsers = GetMaxUsersByPlan(dto.SubscriptionPlan),
            MaxProjects = GetMaxProjectsByPlan(dto.SubscriptionPlan),
            CreatedAt = DateTime.UtcNow
        };

        _context.Tenants.Add(tenant);
        await _context.SaveChangesAsync();

        return MapToResponseDto(tenant);
    }

    public async Task<TenantResponseDto> UpdateTenantAsync(string tenantId, UpdateTenantDto dto)
    {
        var tenant = await _context.Tenants.FindAsync(tenantId);
        if (tenant == null)
        {
            throw new Exception("Tenant not found");
        }

        tenant.CompanyName = dto.CompanyName;
        tenant.Phone = dto.Phone;
        tenant.Address = dto.Address;
        tenant.City = dto.City;
        tenant.State = dto.State;
        tenant.GSTNumber = dto.GSTNumber;
        tenant.PANNumber = dto.PANNumber;
        tenant.Website = dto.Website;
        tenant.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return MapToResponseDto(tenant);
    }

    public async Task<bool> DeleteTenantAsync(string tenantId)
    {
        var tenant = await _context.Tenants.FindAsync(tenantId);
        if (tenant == null) return false;

        // Soft delete - just mark as inactive
        tenant.IsActive = false;
        tenant.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return true;
    }

    private TenantResponseDto MapToResponseDto(Tenant tenant)
    {
        return new TenantResponseDto(
            tenant.Id,
            tenant.CompanyName,
            tenant.CompanyCode,
            tenant.Email,
            tenant.Phone,
            tenant.Address,
            tenant.City,
            tenant.State,
            tenant.GSTNumber,
            tenant.PANNumber,
            tenant.SubscriptionPlan,
            tenant.SubscriptionEndDate,
            tenant.IsActive,
            tenant.MaxUsers,
            tenant.MaxProjects,
            tenant.Users?.Count ?? 0,
            0 // CurrentProjects - will be calculated when Projects entity is created
        );
    }

    private string GenerateCompanyCode(string companyName)
    {
        var prefix = new string(companyName.Take(4).ToArray()).ToUpper();
        var random = new Random().Next(1000, 9999);
        return $"{prefix}{random}";
    }

    private int GetMaxUsersByPlan(string plan)
    {
        return plan switch
        {
            "Free" => 5,
            "Basic" => 20,
            "Premium" => 50,
            "Enterprise" => 200,
            _ => 5
        };
    }

    private int GetMaxProjectsByPlan(string plan)
    {
        return plan switch
        {
            "Free" => 3,
            "Basic" => 10,
            "Premium" => 50,
            "Enterprise" => 999,
            _ => 3
        };
    }
}
