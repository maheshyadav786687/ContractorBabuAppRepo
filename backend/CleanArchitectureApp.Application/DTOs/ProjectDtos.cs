namespace CleanArchitectureApp.Application.DTOs;

public record CreateProjectDto(
    string ProjectCode,
    string Name,
    string? Description,
    string ClientId,
    string? SiteId,

    string? ProjectManagerId,
    string ProjectType,
    decimal? EstimatedBudget,
    DateTime? StartDate,
    DateTime? PlannedEndDate,
    string? ContractType,
    decimal? ContractValue
);

public record UpdateProjectDto(
    string? Name,
    string? Description,
    string? SiteId,
    string? ProjectManagerId,
    string? ProjectType,
    decimal? EstimatedBudget,
    decimal? ActualCost,
    DateTime? StartDate,
    DateTime? PlannedEndDate,
    DateTime? ActualEndDate,
    string? Status,
    int? ProgressPercentage,
    string? ContractType,
    decimal? ContractValue,
    bool? IsActive
);

public record ProjectResponseDto(
    string Id,
    string ProjectCode,
    string Name,
    string? Description,
    string ClientId,
    string? ClientName,
    
    string? SiteId,
    string? SiteName,

    string? ProjectManagerId,
    string? ProjectManagerName,
    string ProjectType,
    decimal? EstimatedBudget,
    decimal? ActualCost,
    DateTime? StartDate,
    DateTime? PlannedEndDate,
    DateTime? ActualEndDate,
    string Status,
    int ProgressPercentage,
    string? ContractType,
    decimal? ContractValue,
    bool IsActive,
    DateTime CreatedAt,
    DateTime? UpdatedAt
);

public record CreateProjectPhaseDto(
    string ProjectId,
    string Name,
    string? Description,
    int Sequence,
    DateTime? PlannedStartDate,
    DateTime? PlannedEndDate,
    decimal? EstimatedCost,
    string? SupervisorId
);

public record UpdateProjectPhaseDto(
    string? Name,
    string? Description,
    int? Sequence,
    DateTime? PlannedStartDate,
    DateTime? PlannedEndDate,
    DateTime? ActualStartDate,
    DateTime? ActualEndDate,
    decimal? EstimatedCost,
    decimal? ActualCost,
    string? Status,
    int? ProgressPercentage,
    string? SupervisorId,
    bool? IsActive
);

public record ProjectPhaseResponseDto(
    string Id,
    string ProjectId,
    string Name,
    string? Description,
    int Sequence,
    DateTime? PlannedStartDate,
    DateTime? PlannedEndDate,
    DateTime? ActualStartDate,
    DateTime? ActualEndDate,
    decimal? EstimatedCost,
    decimal? ActualCost,
    string Status,
    int ProgressPercentage,
    string? SupervisorId,
    string? SupervisorName,
    bool IsActive
);
