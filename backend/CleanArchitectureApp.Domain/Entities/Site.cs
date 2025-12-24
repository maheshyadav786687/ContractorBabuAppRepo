using CleanArchitectureApp.Domain.Entities;

namespace CleanArchitectureApp.Domain.Entities;

public class Site : TenantEntity
{
    public string Id { get; set; } = string.Empty;
    public required string Name { get; set; }
    public required string Address { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? ZipCode { get; set; }
    
    // Relationships
    public string ClientId { get; set; } = string.Empty;
    public Client? Client { get; set; }
    
    public ICollection<Project> Projects { get; set; } = new List<Project>();
    public ICollection<Quotation> Quotations { get; set; } = new List<Quotation>();
    
    // Audit
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string CreatedBy { get; set; } = string.Empty;
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedBy { get; set; }
    public bool IsActive { get; set; } = true;
}
