namespace CleanArchitectureApp.Domain.Entities;

/// <summary>
/// User entity with multi-tenant support and role-based access.
/// Each user belongs to exactly one tenant.
/// </summary>
public class User
{
    public string Id { get; set; } = string.Empty;
    public required string Username { get; set; }
    public required string PasswordHash { get; set; }
    public required string Email { get; set; }
    public string? Phone { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    
    // Multi-tenant support
    public string TenantId { get; set; } = string.Empty;
    public Tenant? Tenant { get; set; }
    
    // Role-based access
    public required string Role { get; set; } // Admin, ProjectManager, SiteSupervisor, Accountant, Worker, Subcontractor, Vendor, Consultant
    
    // Additional fields
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastLoginAt { get; set; }
}
