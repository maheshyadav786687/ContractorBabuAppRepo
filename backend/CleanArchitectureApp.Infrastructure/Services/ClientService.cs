using CleanArchitectureApp.Application.DTOs;
using CleanArchitectureApp.Application.Interfaces;
using CleanArchitectureApp.Domain.Entities;
using CleanArchitectureApp.Infrastructure.Data;
using CleanArchitectureApp.Infrastructure.Helpers;
using Microsoft.EntityFrameworkCore;

namespace CleanArchitectureApp.Infrastructure.Services;

public class ClientService : IClientService
{
    private readonly AppDbContext _context;

    public ClientService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<ClientResponseDto>> GetAllAsync(string tenantId)
    {
        var clients = await _context.Clients.Where(c => c.TenantId == tenantId).ToListAsync();
        return clients.Select(MapToResponseDto);
    }

    public async Task<ClientResponseDto?> GetByIdAsync(string id, string tenantId)
    {
        var client = await _context.Clients.FirstOrDefaultAsync(c => c.Id == id && c.TenantId == tenantId);
        return client == null ? null : MapToResponseDto(client);
    }

    public async Task<ClientResponseDto> CreateAsync(CreateClientDto dto, string tenantId, string userId)
    {
        var client = new Client
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
            CompanyType = dto.CompanyType,
            TenantId = tenantId,
            CreatedBy = userId,
            CreatedAt = DateTime.UtcNow,
            IsActive = true
        };

        _context.Clients.Add(client);
        await _context.SaveChangesAsync();
        return MapToResponseDto(client);
    }

    public async Task<ClientResponseDto?> UpdateAsync(string id, UpdateClientDto dto, string tenantId, string userId)
    {
        var client = await _context.Clients.FirstOrDefaultAsync(c => c.Id == id && c.TenantId == tenantId);
        if (client == null) return null;

        client.Name = dto.Name ?? client.Name;
        client.ContactPerson = dto.ContactPerson ?? client.ContactPerson;
        client.Email = dto.Email ?? client.Email;
        client.Phone = dto.Phone ?? client.Phone;
        client.AlternatePhone = dto.AlternatePhone ?? client.AlternatePhone;
        client.Address = dto.Address ?? client.Address;
        client.City = dto.City ?? client.City;
        client.State = dto.State ?? client.State;
        client.PinCode = dto.PinCode ?? client.PinCode;
        client.GSTNumber = dto.GSTNumber ?? client.GSTNumber;
        client.PANNumber = dto.PANNumber ?? client.PANNumber;
        client.CompanyType = dto.CompanyType ?? client.CompanyType;
        client.IsActive = dto.IsActive ?? client.IsActive;
        client.UpdatedBy = userId;
        client.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return MapToResponseDto(client);
    }

    public async Task<bool> DeleteAsync(string id, string tenantId)
    {
        var client = await _context.Clients.FirstOrDefaultAsync(c => c.Id == id && c.TenantId == tenantId);
        if (client == null) return false;
        _context.Clients.Remove(client);
        await _context.SaveChangesAsync();
        return true;
    }

    private static ClientResponseDto MapToResponseDto(Client client)
    {
        return new ClientResponseDto(
            client.Id,
            client.Name,
            client.ContactPerson,
            client.Email,
            client.Phone,
            client.AlternatePhone,
            client.Address,
            client.City,
            client.State,
            client.PinCode,
            client.GSTNumber,
            client.PANNumber,
            client.CompanyType,
            client.IsActive,
            client.CreatedAt,
            client.UpdatedAt
        );
    }
}