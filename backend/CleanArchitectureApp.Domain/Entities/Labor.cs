namespace CleanArchitectureApp.Domain.Entities;

/// <summary>
/// Represents a daily wage worker or laborer.
/// </summary>
public class Labor : TenantEntity
{
    public string Id { get; set; } = string.Empty;
    public required string Name { get; set; }
    public string? Phone { get; set; }
    
    public string LaborType { get; set; } = "Unskilled"; // Skilled, Unskilled, Mason, Carpenter, etc.
    
    public decimal DailyWage { get; set; } // Standard daily rate
    
    public string? Address { get; set; }
    public string? AadharNumber { get; set; } // ID Proof
    
    public bool IsActive { get; set; } = true;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string CreatedBy { get; set; } = string.Empty;
}

/// <summary>
/// Daily attendance record for a laborer.
/// </summary>
public class Attendance : TenantEntity
{
    public string Id { get; set; } = string.Empty;
    
    public DateTime Date { get; set; }
    
    public string LaborId { get; set; } = string.Empty;
    public Labor? Labor { get; set; }
    

    
    public bool IsPresent { get; set; } = true;
    public bool IsHalfDay { get; set; } = false;
    public decimal OvertimeHours { get; set; } = 0;
    
    public decimal WageForDay { get; set; } // Calculated based on attendance type
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string CreatedBy { get; set; } = string.Empty;
}
