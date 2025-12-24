namespace CleanArchitectureApp.Domain.Entities;

/// <summary>
/// Represents current stock level of an item at a specific site.
/// </summary>
public class Inventory : TenantEntity
{
    public string Id { get; set; } = string.Empty;
    

    
    public string ItemId { get; set; } = string.Empty;
    public Item? Item { get; set; }
    
    // Stock Levels
    public decimal Quantity { get; set; }
    public decimal ReorderLevel { get; set; } = 0; // Alert when stock goes below this
    
    // Valuation
    public decimal AverageRate { get; set; } // Weighted average cost
    public decimal TotalValue => Quantity * AverageRate;
    
    public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
    public string? LastUpdatedBy { get; set; }
}
