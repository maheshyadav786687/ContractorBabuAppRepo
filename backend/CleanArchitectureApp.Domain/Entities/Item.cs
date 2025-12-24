namespace CleanArchitectureApp.Domain.Entities;

/// <summary>
/// Master catalog of materials, labor, and equipment items.
/// Used in BOQ (Bill of Quantities) and quotations.
/// </summary>
public class Item : TenantEntity
{
    public string Id { get; set; } = string.Empty;
    public required string Code { get; set; } // Unique item code
    public required string Name { get; set; }
    public string? Description { get; set; }
    
    // Category
    public required string Category { get; set; } // Material, Labor, Equipment, Service
    public string? SubCategory { get; set; } // Cement, Steel, Skilled Labor, Excavator, etc.
    
    // Unit of Measurement
    public required string Unit { get; set; } // Kg, Ton, Cubic Meter, Sqft, Hour, Day, Piece
    
    // Pricing
    public decimal? StandardRate { get; set; }
    public  decimal? MinRate { get; set; }
    public decimal? MaxRate { get; set; }
    
    // Tax
    public decimal? GSTPercentage { get; set; }
    public string? HSNCode { get; set; } // For GST compliance
    
    // Specifications
    public string? Brand { get; set; }
    public string? Specifications { get; set; }
    
    public bool IsActive { get; set; } = true;
    
    // Audit fields
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string CreatedBy { get; set; } = string.Empty;
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedBy { get; set; }
    
    // Navigation properties
    // Removed QuotationItems navigation
}
