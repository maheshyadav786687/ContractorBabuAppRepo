namespace CleanArchitectureApp.Domain.Entities;

/// <summary>
/// Individual item in a quotation with quantity and rate.
/// Links Items Master to Quotations.
/// </summary>
public class QuotationItem : TenantEntity
{
    public string Id { get; set; } = string.Empty;
    public string QuotationId { get; set; } = string.Empty;
    public Quotation? Quotation { get; set; }
    
    // Removed ItemId, Item, ProjectPhaseId, ProjectPhase
    
    public string? Description { get; set; }
    
    // Quantity & Rate
    public decimal Quantity { get; set; }
    public decimal? Width { get; set; } // New field
    public decimal? Length { get; set; } // New field
    public decimal? Height { get; set; } // New field
    public decimal? Area { get; set; } // New field
    public required string Unit { get; set; }
    public decimal Rate { get; set; }
    public decimal Amount { get; set; }
    
    // Removed Tax fields and other details as requested
    
    public bool IsWithMaterial { get; set; } = false;
    public int Sequence { get; set; } // Display order
    
    // Audit fields
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string CreatedBy { get; set; } = string.Empty;
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedBy { get; set; }
}
