namespace CleanArchitectureApp.Domain.Entities;

/// <summary>
/// Represents a Purchase Order (PO) issued to a vendor.
/// </summary>
public class PurchaseOrder : TenantEntity
{
    public string Id { get; set; } = string.Empty;
    public required string PONumber { get; set; } // Unique PO Number
    
    // Relationships
    public string VendorId { get; set; } = string.Empty;
    public Vendor? Vendor { get; set; }
    
    public string ProjectId { get; set; } = string.Empty;
    public Project? Project { get; set; }
    
    // Dates
    public DateTime PODate { get; set; } = DateTime.UtcNow;
    public DateTime? ExpectedDeliveryDate { get; set; }
    
    // Amounts
    public decimal SubTotal { get; set; }
    public decimal? TaxAmount { get; set; }
    public decimal? DiscountAmount { get; set; }
    public decimal GrandTotal { get; set; }
    
    // Status
    public string Status { get; set; } = "Draft"; // Draft, Sent, Approved, PartialReceived, Completed, Cancelled
    
    // Terms
    public string? PaymentTerms { get; set; }
    public string? DeliveryTerms { get; set; }
    public string? Notes { get; set; }
    
    public bool IsActive { get; set; } = true;
    
    // Audit fields
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string CreatedBy { get; set; } = string.Empty;
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedBy { get; set; }
    
    // Navigation properties
    public ICollection<PurchaseOrderItem> Items { get; set; } = new List<PurchaseOrderItem>();
}
