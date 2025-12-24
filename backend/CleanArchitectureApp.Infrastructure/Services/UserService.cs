using CleanArchitectureApp.Application.DTOs;
using CleanArchitectureApp.Application.Interfaces;
using CleanArchitectureApp.Domain.Entities;
using CleanArchitectureApp.Infrastructure.Data;
using CleanArchitectureApp.Infrastructure.Helpers;
using Microsoft.EntityFrameworkCore;

namespace CleanArchitectureApp.Infrastructure.Services;

public class UserService : IUserService
{
    private readonly AppDbContext _context;

    public UserService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<UserResponseDto?> GetUserByIdAsync(string userId, string tenantId)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId && u.TenantId == tenantId);
        if (user == null) return null;
        return MapToResponseDto(user);
    }

    public async Task<UserResponseDto> CreateUserAsync(CreateUserDto dto, string tenantId)
    {
        var user = new User
        {
            Id = UlidGenerator.Generate(),
            Username = dto.Username,
            Email = dto.Email,
            PasswordHash = dto.Password, // TODO: Hash
            Role = dto.Role,
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Phone = dto.Phone,
            TenantId = tenantId,
            CreatedAt = DateTime.UtcNow,
            IsActive = true
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        return MapToResponseDto(user);
    }

    public async Task<UserResponseDto> UpdateUserAsync(string userId, UpdateUserDto dto, string tenantId)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId && u.TenantId == tenantId);
        if (user == null) throw new Exception("User not found");

        user.Email = dto.Email ?? user.Email;
        user.FirstName = dto.FirstName ?? user.FirstName;
        user.LastName = dto.LastName ?? user.LastName;
        user.Phone = dto.Phone ?? user.Phone;
        user.Role = dto.Role ?? user.Role;
        user.IsActive = dto.IsActive ?? user.IsActive;
        await _context.SaveChangesAsync();
        return MapToResponseDto(user);
    }

    public async Task<bool> DeleteUserAsync(string userId, string tenantId)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId && u.TenantId == tenantId);
        if (user == null) return false;
        _context.Users.Remove(user);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<IEnumerable<UserResponseDto>> GetUsersByTenantAsync(string tenantId)
    {
        var users = await _context.Users.Where(u => u.TenantId == tenantId).ToListAsync();
        return users.Select(MapToResponseDto);
    }

    private static UserResponseDto MapToResponseDto(User user)
    {
        return new UserResponseDto(
            user.Id,
            user.Username,
            user.Email,
            user.FirstName,
            user.LastName,
            user.Phone,
            user.Role,
            user.IsActive,
            user.CreatedAt,
            user.LastLoginAt
        );
    }
}