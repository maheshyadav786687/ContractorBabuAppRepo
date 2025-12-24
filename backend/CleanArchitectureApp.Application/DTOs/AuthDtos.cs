namespace CleanArchitectureApp.Application.DTOs;

public record LoginDto(string Username, string Password);
public record RegisterDto(string CompanyName, string FullName, string Email, string Password);
public record AuthResponseDto(string Token, string Username, string Role, string? TenantId);
