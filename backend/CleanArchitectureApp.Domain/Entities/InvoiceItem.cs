namespace CleanArchitectureApp.Domain.Entities;

/// <summary>
/// Line item belonging to an Invoice.
/// </summary>
public class InvoiceItem : TenantEntity
{
    public string Id { get; set; } = string.Empty;
    public string InvoiceId { get; set; } = string.Empty;
    public Invoice? Invoice { get; set; }
    public string ItemId { get; set; } = string.Empty;
    public Item? Item { get; set; }
    public decimal Quantity { get; set; }
    public decimal Rate { get; set; }
    public decimal TaxPercentage { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal Amount { get; set; }
    public decimal TotalAmount { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string CreatedBy { get; set; } = string.Empty;
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedBy { get; set; }
}
