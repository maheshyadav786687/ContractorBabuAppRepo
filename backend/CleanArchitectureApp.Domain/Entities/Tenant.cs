namespace CleanArchitectureApp.Domain.Entities;

/// <summary>
/// Represents a tenant company in the SaaS multi-tenant system.
/// Each tenant has completely isolated data.
/// </summary>
public class Tenant
{
    public string Id { get; set; } = string.Empty;
    public required string CompanyName { get; set; }
    public string? CompanyCode { get; set; } // Unique identifier
    public string? GSTNumber { get; set; }
    public string? PANNumber { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? Country { get; set; } = "India";
    public string? PinCode { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? Website { get; set; }
    
    // Subscription details
    public string SubscriptionPlan { get; set; } = "Free"; // Free, Basic, Premium, Enterprise
    public DateTime SubscriptionStartDate { get; set; } = DateTime.UtcNow;
    public DateTime? SubscriptionEndDate { get; set; }
    public bool IsActive { get; set; } = true;
    
    // Limits based on subscription
    public int MaxUsers { get; set; } = 5;
    public int MaxProjects { get; set; } = 3;
    
    // Audit
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    
    // Navigation properties
    public ICollection<User> Users { get; set; } = new List<User>();
}
