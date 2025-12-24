namespace CleanArchitectureApp.Domain.Entities;

/// <summary>
/// Represents a phase in a construction project.
/// Examples: Foundation, Structure, Plumbing, Electrical, Finishing
/// </summary>
public class ProjectPhase : TenantEntity
{
    public string Id { get; set; } = string.Empty;
    public string ProjectId { get; set; } = string.Empty;
    public Project? Project { get; set; }
    
    public required string Name { get; set; }
    public string? Description { get; set; }
    public int Sequence { get; set; } // Order of execution
    
    // Timeline
    public DateTime? PlannedStartDate { get; set; }
    public DateTime? PlannedEndDate { get; set; }
    public DateTime? ActualStartDate { get; set; }
    public DateTime? ActualEndDate { get; set; }
    
    // Budget
    public decimal? EstimatedCost { get; set; }
    public decimal? ActualCost { get; set; }
    
    // Status
    public string Status { get; set; } = "NotStarted"; // NotStarted, InProgress, Completed, OnHold
    public int ProgressPercentage { get; set; } = 0;
    
    // Assignee
    public string? SupervisorId { get; set; }
    public User? Supervisor { get; set; }
    
    public bool IsActive { get; set; } = true;
    
    // Audit fields
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string CreatedBy { get; set; } = string.Empty;
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedBy { get; set; }
    
    // Navigation properties
    public ICollection<ProjectTask> Tasks { get; set; } = new List<ProjectTask>();
}
