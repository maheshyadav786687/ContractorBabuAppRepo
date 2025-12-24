namespace CleanArchitectureApp.Domain.Entities;

/// <summary>
/// Represents a task within a project phase.
/// Can have dependencies, assignments, and track progress.
/// </summary>
public class ProjectTask : TenantEntity
{
    public string Id { get; set; } = string.Empty;
    public required string TaskCode { get; set; }
    public required string Name { get; set; }
    public string? Description { get; set; }
    
    // Relationships
    public string ProjectId { get; set; } = string.Empty;
    public Project? Project { get; set; }
    
    public string? ProjectPhaseId { get; set; }
    public ProjectPhase? ProjectPhase { get; set; }
    
    // Assignment
    public string? AssignedToId { get; set; }
    public User? AssignedTo { get; set; }
    
    public string? AssignedToType { get; set; } // Internal, Subcontractor, Vendor
    public string? ExternalAssigneeId { get; set; } // If assigned to subcontractor/vendor
    
    // Timeline
    public DateTime? PlannedStartDate { get; set; }
    public DateTime? PlannedEndDate { get; set; }
    public DateTime? ActualStartDate { get; set; }
    public DateTime? ActualEndDate { get; set; }
    public int DurationDays { get; set; }
    
    // Effort
    public decimal? EstimatedHours { get; set; }
    public decimal? ActualHours { get; set; }
    
    // Cost
    public decimal? EstimatedCost { get; set; }
    public decimal? ActualCost { get; set; }
    
    // Status & Progress
    public string Status { get; set; } = "NotStarted"; // NotStarted, InProgress, Completed, OnHold, Cancelled
    public int ProgressPercentage { get; set; } = 0;
    
    // Priority
    public string Priority { get; set; } = "Medium"; // Low, Medium, High, Critical
    
    // Dependencies
    public bool IsCriticalPath { get; set; }
    public string? DependencyType { get; set; } // FinishToStart, StartToStart, etc.
    
    // Quality & Safety
    public bool RequiresQualityCheck { get; set; }
    public bool? QualityCheckPassed { get; set; }
    public DateTime? QualityCheckDate { get; set; }
    public string? QualityCheckedBy { get; set; }
    
    public bool IsActive { get; set; } = true;
    
    // Audit fields
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string CreatedBy { get; set; } = string.Empty;
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedBy { get; set; }
    
    // Navigation properties
    public ICollection<TaskDependency> Dependencies { get; set; } = new List<TaskDependency>();
    public ICollection<TaskDependency> DependentTasks { get; set; } = new List<TaskDependency>();
}
