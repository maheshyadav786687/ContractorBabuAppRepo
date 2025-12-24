using CleanArchitectureApp.Application.DTOs;
using CleanArchitectureApp.Application.Interfaces;
using CleanArchitectureApp.Domain.Entities;
using CleanArchitectureApp.Infrastructure.Data;
using CleanArchitectureApp.Infrastructure.Helpers;
using Microsoft.EntityFrameworkCore;

namespace CleanArchitectureApp.Infrastructure.Services;

public class VendorService : IVendorService
{
    private readonly AppDbContext _context;

    public VendorService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<VendorResponseDto>> GetAllAsync(string tenantId)
    {
        var vendors = await _context.Vendors.Where(v => v.TenantId == tenantId).ToListAsync();
        return vendors.Select(v => MapToResponseDto(v));
    }

    public async Task<VendorResponseDto?> GetByIdAsync(string id, string tenantId)
    {
        var v = await _context.Vendors.FirstOrDefaultAsync(x => x.Id == id && x.TenantId == tenantId);
        return v == null ? null : MapToResponseDto(v);
    }

    public async Task<VendorResponseDto> CreateAsync(CreateVendorDto dto, string tenantId, string userId)
    {
        var v = new Vendor
        {
            Id = UlidGenerator.Generate(),
            Name = dto.Name,
            ContactPerson = dto.ContactPerson,
            Email = dto.Email,
            Phone = dto.Phone,
            AlternatePhone = dto.AlternatePhone,
            Address = dto.Address,
            City = dto.City,
            State = dto.State,
            PinCode = dto.PinCode,
            GSTNumber = dto.GSTNumber,
            PANNumber = dto.PANNumber,
            BankName = dto.BankName,
            AccountNumber = dto.AccountNumber,
            IFSC = dto.IFSC,
            VendorType = dto.VendorType,
            Rating = dto.Rating ?? 0,
            TenantId = tenantId,
            CreatedBy = userId,
            CreatedAt = DateTime.UtcNow,
            IsActive = true
        };

        _context.Vendors.Add(v);
        await _context.SaveChangesAsync();
        return MapToResponseDto(v);
    }

    public async Task<VendorResponseDto?> UpdateAsync(string id, UpdateVendorDto dto, string tenantId, string userId)
    {
        var v = await _context.Vendors.FirstOrDefaultAsync(x => x.Id == id && x.TenantId == tenantId);
        if (v == null) return null;

        v.Name = dto.Name ?? v.Name;
        v.ContactPerson = dto.ContactPerson ?? v.ContactPerson;
        v.Email = dto.Email ?? v.Email;
        v.Phone = dto.Phone ?? v.Phone;
        v.AlternatePhone = dto.AlternatePhone ?? v.AlternatePhone;
        v.Address = dto.Address ?? v.Address;
        v.City = dto.City ?? v.City;
        v.State = dto.State ?? v.State;
        v.PinCode = dto.PinCode ?? v.PinCode;
        v.GSTNumber = dto.GSTNumber ?? v.GSTNumber;
        v.PANNumber = dto.PANNumber ?? v.PANNumber;
        v.BankName = dto.BankName ?? v.BankName;
        v.AccountNumber = dto.AccountNumber ?? v.AccountNumber;
        v.IFSC = dto.IFSC ?? v.IFSC;
        v.VendorType = dto.VendorType ?? v.VendorType;
        v.Rating = dto.Rating ?? v.Rating;
        v.IsActive = dto.IsActive ?? v.IsActive;
        v.UpdatedAt = DateTime.UtcNow;
        v.UpdatedBy = userId;

        await _context.SaveChangesAsync();
        return MapToResponseDto(v);
    }

    public async Task<bool> DeleteAsync(string id, string tenantId)
    {
        var v = await _context.Vendors.FirstOrDefaultAsync(x => x.Id == id && x.TenantId == tenantId);
        if (v == null) return false;
        _context.Vendors.Remove(v);
        await _context.SaveChangesAsync();
        return true;
    }

    private static VendorResponseDto MapToResponseDto(Vendor v)
    {
        return new VendorResponseDto(v.Id, v.Name, v.ContactPerson, v.Email, v.Phone, v.AlternatePhone, v.Address, v.City, v.State, v.PinCode, v.GSTNumber, v.PANNumber, v.BankName, v.AccountNumber, v.IFSC, v.VendorType, v.Rating, v.IsActive, v.CreatedAt, v.UpdatedAt);
    }
}