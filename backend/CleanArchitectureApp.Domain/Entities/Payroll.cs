namespace CleanArchitectureApp.Domain.Entities;

/// <summary>
/// Weekly or Monthly payroll record for a laborer.
/// </summary>
public class Payroll : TenantEntity
{
    public string Id { get; set; } = string.Empty;
    
    public string LaborId { get; set; } = string.Empty;
    public Labor? Labor { get; set; }
    
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    
    public int TotalDaysPresent { get; set; }
    public decimal TotalOvertimeHours { get; set; }
    
    public decimal TotalWageAmount { get; set; }
    public decimal? AdvanceDeduction { get; set; }
    public decimal? BonusAmount { get; set; }
    public decimal NetPayable { get; set; }
    
    public string Status { get; set; } = "Draft"; // Draft, Paid
    public DateTime? PaymentDate { get; set; }
    public string? PaymentMode { get; set; } // Cash, Bank Transfer
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string CreatedBy { get; set; } = string.Empty;
}
