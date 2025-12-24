namespace CleanArchitectureApp.Domain.Entities;

/// <summary>
/// Master data for types of expenses (e.g., Travel, Fuel, Food, Site Supplies).
/// </summary>
public class ExpenseHead : TenantEntity
{
    public string Id { get; set; } = string.Empty;
    public required string Name { get; set; }
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
}

/// <summary>
/// Represents an expense incurred at a site or office.
/// </summary>
public class Expense : TenantEntity
{
    public string Id { get; set; } = string.Empty;
    
    public DateTime ExpenseDate { get; set; } = DateTime.UtcNow;
    
    public string ExpenseHeadId { get; set; } = string.Empty;
    public ExpenseHead? ExpenseHead { get; set; }
    
    public string? ProjectId { get; set; }
    public Project? Project { get; set; }
    

    
    public decimal Amount { get; set; }
    public string? Description { get; set; }
    
    // Who spent the money?
    public string? SpentById { get; set; } // User ID
    public User? SpentBy { get; set; }
    
    // Approval
    public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected
    public string? ApprovedById { get; set; }
    public DateTime? ApprovedDate { get; set; }
    
    // Proof
    public string? ReceiptUrl { get; set; } // URL to uploaded image
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string CreatedBy { get; set; } = string.Empty;
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedBy { get; set; }
}
