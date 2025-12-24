using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using CleanArchitectureApp.Application.DTOs;
using CleanArchitectureApp.Application.Interfaces;
using CleanArchitectureApp.Domain.Entities;
using CleanArchitectureApp.Infrastructure.Data;
using CleanArchitectureApp.Infrastructure.Helpers;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace CleanArchitectureApp.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly IConfiguration _configuration;
    private readonly AppDbContext _context;

    public AuthService(IConfiguration configuration, AppDbContext context)
    {
        _configuration = configuration;
        _context = context;
    }

    public async Task<AuthResponseDto?> LoginAsync(LoginDto loginDto)
    {
        // Find user with tenant information
        var user = await _context.Users
            .Include(u => u.Tenant)
            .FirstOrDefaultAsync(u => u.Email == loginDto.Username && u.PasswordHash == loginDto.Password);
        
        if (user == null) return null;

        // Check if user and tenant are active
        if (!user.IsActive || (user.Tenant != null && !user.Tenant.IsActive))
        {
            return null;
        }

        // Update last login
        user.LastLoginAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        var token = GenerateJwtToken(user);
        return new AuthResponseDto(token, user.Username, user.Role, user.TenantId);
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterDto registerDto)
    {
        // Check if email already exists globally
        if (await _context.Users.AnyAsync(u => u.Email == registerDto.Email))
        {
            throw new Exception("Email already exists");
        }

        // Create new Tenant
        var tenant = new Tenant
        {
            Id = UlidGenerator.Generate(),
            CompanyName = registerDto.CompanyName,
            SubscriptionPlan = "Free",
            SubscriptionStartDate = DateTime.UtcNow,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };
        
        _context.Tenants.Add(tenant);

        // Split name
        var names = registerDto.FullName.Trim().Split(' ', 2);
        var firstName = names[0];
        var lastName = names.Length > 1 ? names[1] : "";

        // Create Admin User for the Tenant
        var user = new User
        {
            Id = UlidGenerator.Generate(),
            TenantId = tenant.Id,
            Username = registerDto.Email, // Using Email as Username
            Email = registerDto.Email,
            PasswordHash = registerDto.Password, // In real app, hash this properly
            Role = "Admin", // First user is Admin
            FirstName = firstName,
            LastName = lastName,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };
        
        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        // Assign tenant to user for token generation
        user.Tenant = tenant;

        var token = GenerateJwtToken(user);
        return new AuthResponseDto(token, user.Username, user.Role, user.TenantId);
    }

    private string GenerateJwtToken(User user)
    {
        var keyString = _configuration["Jwt:Key"] ?? throw new InvalidOperationException("Jwt:Key not configured");
        var key = Encoding.UTF8.GetBytes(keyString);
        var issuer = _configuration["Jwt:Issuer"] ?? "ContractorBabuAPI";
        var audience = _configuration["Jwt:Audience"] ?? "ContractorBabuClient";

        var tokenHandler = new JwtSecurityTokenHandler();
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role),
                new Claim("TenantId", user.TenantId ?? string.Empty),
                new Claim("TenantName", user.Tenant?.CompanyName ?? "Unknown")
            }),
            Expires = DateTime.UtcNow.AddHours(8), // 8 hour token validity
            Issuer = issuer,
            Audience = audience,
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };
        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }
}
