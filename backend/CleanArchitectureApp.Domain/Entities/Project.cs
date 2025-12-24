namespace CleanArchitectureApp.Domain.Entities;

/// <summary>
/// Represents a construction project with multiple phases.
/// Parent entity for all project-related activities.
/// </summary>
public class Project : TenantEntity
{
    public string Id { get; set; } = string.Empty;
    public required string ProjectCode { get; set; } // Unique project identifier
    public required string Name { get; set; }
    public string? Description { get; set; }
    
    // Relationships
    public string ClientId { get; set; } = string.Empty;
    public Client? Client { get; set; }
    
    public string? SiteId { get; set; }
    public Site? Site { get; set; }
    

    
    // Project Manager
    public string? ProjectManagerId { get; set; }
    public User? ProjectManager { get; set; }
    
    // Project Details
    public string ProjectType { get; set; } = "Residential"; // Residential, Commercial, Industrial, Infrastructure
    public decimal? EstimatedBudget { get; set; }
    public decimal? ActualCost { get; set; }
    
    // Timeline
    public DateTime? StartDate { get; set; }
    public DateTime? PlannedEndDate { get; set; }
    public DateTime? ActualEndDate { get; set; }
    
    // Status
    public string Status { get; set; } = "Planning"; // Planning, InProgress, OnHold, Completed, Cancelled
    public int ProgressPercentage { get; set; } = 0;
    
    // Contract Details
    public string? ContractType { get; set; } // Fixed, TimeAndMaterial, CostPlus
    public decimal? ContractValue { get; set; }
    
    public bool IsActive { get; set; } = true;
    
    // Audit fields
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string CreatedBy { get; set; } = string.Empty;
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedBy { get; set; }
    
    // Navigation properties
    public ICollection<ProjectPhase> Phases { get; set; } = new List<ProjectPhase>();
    public ICollection<Quotation> Quotations { get; set; } = new List<Quotation>();
    public ICollection<ProjectTask> Tasks { get; set; } = new List<ProjectTask>();
}
