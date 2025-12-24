namespace CleanArchitectureApp.Domain.Entities;

/// <summary>
/// Logs all material movements (Inward, Outward, Transfer).
/// Acts as a ledger for inventory.
/// </summary>
public class MaterialTransaction : TenantEntity
{
    public string Id { get; set; } = string.Empty;
    
    public DateTime TransactionDate { get; set; } = DateTime.UtcNow;
    
    // Movement Type
    public string TransactionType { get; set; } = "Inward"; // Inward, Outward, Transfer, Adjustment
    public string ReferenceType { get; set; } = "PO"; // PO (Purchase Order), Consumption, Transfer, StockTake
    public string? ReferenceId { get; set; } // PONumber, etc.
    
    // Location

    
    // Item Details
    public string ItemId { get; set; } = string.Empty;
    public Item? Item { get; set; }
    
    public decimal Quantity { get; set; }
    public string Unit { get; set; } = string.Empty;
    public decimal Rate { get; set; } // Cost per unit at time of transaction
    public decimal Amount => Quantity * Rate;
    
    // For Transfers

    
    // For Consumption
    public string? ProjectId { get; set; }
    public string? ProjectTaskId { get; set; } // Track consumption against specific task
    
    public string? Remarks { get; set; }
    
    // Audit
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string CreatedBy { get; set; } = string.Empty;
}
