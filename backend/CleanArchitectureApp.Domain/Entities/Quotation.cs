namespace CleanArchitectureApp.Domain.Entities;

/// <summary>
/// Represents a BOQ (Bill of Quantities) quotation for a project.
/// Contains all items with quantities and rates.
/// </summary>
public class Quotation : TenantEntity
{
    public string Id { get; set; } = string.Empty;
    public required string QuotationNumber { get; set; }
    public string ProjectId { get; set; } = string.Empty;
    public Project? Project { get; set; }
    
    public string? SiteId { get; set; }
    public Site? Site { get; set; }
    
    public string? Description { get; set; }
    public string? Remarks { get; set; }
    
    public DateTime QuotationDate { get; set; } = DateTime.UtcNow;
    
    public string Status { get; set; } = "Draft"; // Draft, Sent, Approved, Rejected
    
    public decimal SubTotal {  get; set; }
    public decimal TaxPercentage {  get; set; }
    public decimal TaxAmount {  get; set; }
    public decimal DiscountPercentage {  get; set; }
    public decimal DiscountAmount {  get; set; }
    public decimal GrandTotal {  get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public ICollection<QuotationItem> Items { get; set; } = new List<QuotationItem>();
}
