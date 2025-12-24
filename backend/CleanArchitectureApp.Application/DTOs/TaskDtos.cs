namespace CleanArchitectureApp.Application.DTOs;

public record CreateProjectTaskDto(
    string TaskCode,
    string Name,
    string? Description,
    string ProjectId,
    string? ProjectPhaseId,
    string? AssignedToId,
    string? AssignedToType,
    string? ExternalAssigneeId,
    DateTime? PlannedStartDate,
    DateTime? PlannedEndDate,
    int DurationDays,
    decimal? EstimatedHours,
    decimal? EstimatedCost,
    string Priority,
    bool IsCriticalPath,
    bool RequiresQualityCheck
);

public record UpdateProjectTaskDto(
    string? Name,
    string? Description,
    string? ProjectPhaseId,
    string? AssignedToId,
    string? AssignedToType,
    string? ExternalAssigneeId,
    DateTime? PlannedStartDate,
    DateTime? PlannedEndDate,
    DateTime? ActualStartDate,
    DateTime? ActualEndDate,
    int? DurationDays,
    decimal? EstimatedHours,
    decimal? ActualHours,
    decimal? EstimatedCost,
    decimal? ActualCost,
    string? Status,
    int? ProgressPercentage,
    string? Priority,
    bool? IsCriticalPath,
    bool? RequiresQualityCheck,
    bool? QualityCheckPassed,
    DateTime? QualityCheckDate,
    string? QualityCheckedBy,
    bool? IsActive
);

public record ProjectTaskResponseDto(
    string Id,
    string TaskCode,
    string Name,
    string? Description,
    string ProjectId,
    string? ProjectPhaseId,
    string? ProjectPhaseName,
    string? AssignedToId,
    string? AssignedToName,
    string? AssignedToType,
    string? ExternalAssigneeId,
    DateTime? PlannedStartDate,
    DateTime? PlannedEndDate,
    DateTime? ActualStartDate,
    DateTime? ActualEndDate,
    int DurationDays,
    decimal? EstimatedHours,
    decimal? ActualHours,
    decimal? EstimatedCost,
    decimal? ActualCost,
    string Status,
    int ProgressPercentage,
    string Priority,
    bool IsCriticalPath,
    bool RequiresQualityCheck,
    bool? QualityCheckPassed,
    DateTime? QualityCheckDate,
    string? QualityCheckedBy,
    bool IsActive,
    DateTime CreatedAt,
    DateTime? UpdatedAt
);

public record CreateTaskDependencyDto(
    string PredecessorTaskId,
    string SuccessorTaskId,
    string DependencyType,
    int LagDays
);

public record TaskDependencyResponseDto(
    string Id,
    string PredecessorTaskId,
    string PredecessorTaskCode,
    string PredecessorTaskName,
    string SuccessorTaskId,
    string SuccessorTaskCode,
    string SuccessorTaskName,
    string DependencyType,
    int LagDays
);
