namespace CleanArchitectureApp.Domain.Entities;

/// <summary>
/// Represents a supplier or vendor who provides materials or services.
/// </summary>
public class Vendor : TenantEntity
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
    
    // Tax & Compliance
    public string? GSTNumber { get; set; }
    public string? PANNumber { get; set; }
    public string? BankName { get; set; }
    public string? AccountNumber { get; set; }
    public string? IFSC { get; set; }
    
    // Vendor Type
    public string VendorType { get; set; } = "MaterialSupplier"; // MaterialSupplier, ServiceProvider, Subcontractor
    
    // Rating
    public int Rating { get; set; } = 0; // 1-5 stars
    
    public bool IsActive { get; set; } = true;
    
    // Audit fields
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string CreatedBy { get; set; } = string.Empty;
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedBy { get; set; }
    
    // Navigation properties
    public ICollection<PurchaseOrder> PurchaseOrders { get; set; } = new List<PurchaseOrder>();
}
