namespace CleanArchitectureApp.Domain.Entities;

/// <summary>
/// Represents an item line in a Purchase Order.
/// </summary>
public class PurchaseOrderItem : TenantEntity
{
    public string Id { get; set; } = string.Empty;
    
    public string PurchaseOrderId { get; set; } = string.Empty;
    public PurchaseOrder? PurchaseOrder { get; set; }
    
    public string ItemId { get; set; } = string.Empty;
    public Item? Item { get; set; }
    
    // Quantity & Rate
    public decimal Quantity { get; set; }
    public decimal Rate { get; set; }
    public string Unit { get; set; } = string.Empty;
    
    // Tax
    public decimal? GSTPercentage { get; set; }
    public decimal? GSTAmount { get; set; }
    
    // Totals
    public decimal Amount { get; set; } // Qty * Rate
    public decimal TotalAmount { get; set; } // Amount + GST
    
    // Receiving Status
    public decimal ReceivedQuantity { get; set; } = 0;
    public decimal PendingQuantity => Quantity - ReceivedQuantity;
    
    // Audit fields
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string CreatedBy { get; set; } = string.Empty;
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedBy { get; set; }
}
