namespace CleanArchitectureApp.Domain.Entities;

/// <summary>
/// Represents a client/customer for construction projects.
/// Each client belongs to a tenant company.
/// </summary>
public class Client : TenantEntity
{
    public string Id { get; set; } = string.Empty;
    public required string Name { get; set; }
    public required string ContactPerson { get; set; }
    public required string Email { get; set; }
    public required string Phone { get; set; }
    public string? AlternatePhone { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? PinCode { get; set; }
    public string? GSTNumber { get; set; }
    public string? PANNumber { get; set; }
    public string? CompanyType { get; set; } // Individual, Company, Partnership, etc.
    public bool IsActive { get; set; } = true;
    
    // Audit fields
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string CreatedBy { get; set; } = string.Empty; // UserId
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedBy { get; set; }
    
    // Navigation properties
    // Navigation properties
    public ICollection<Project> Projects { get; set; } = new List<Project>();
    public ICollection<Site> Sites { get; set; } = new List<Site>();
}
