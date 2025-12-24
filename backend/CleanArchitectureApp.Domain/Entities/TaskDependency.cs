namespace CleanArchitectureApp.Domain.Entities;

/// <summary>
/// Represents task dependencies for Gantt chart and critical path.
/// Defines relationships between tasks (predecessor/successor).
/// </summary>
public class TaskDependency : TenantEntity
{
    public string Id { get; set; } = string.Empty;
    
    // Predecessor task (must complete before)
    public string PredecessorTaskId { get; set; } = string.Empty;
    public ProjectTask? PredecessorTask { get; set; }
    
    // Successor task (depends on predecessor)
    public string SuccessorTaskId { get; set; } = string.Empty;
    public ProjectTask? SuccessorTask { get; set; }
    
    // Dependency type
    public string DependencyType { get; set; } = "FinishToStart";
    // FinishToStart: Successor starts when predecessor finishes
    // StartToStart: Both start together
    // FinishToFinish: Both finish together
    // StartToFinish: Successor finishes when predecessor starts
    
    // Lag time (in days, can be negative for lead time)
    public int LagDays { get; set; } = 0;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string CreatedBy { get; set; } = string.Empty;
}
