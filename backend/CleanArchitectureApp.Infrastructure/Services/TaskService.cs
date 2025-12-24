using CleanArchitectureApp.Application.DTOs;
using CleanArchitectureApp.Application.Interfaces;
using CleanArchitectureApp.Domain.Entities;
using CleanArchitectureApp.Infrastructure.Data;
using CleanArchitectureApp.Infrastructure.Helpers;
using Microsoft.EntityFrameworkCore;

namespace CleanArchitectureApp.Infrastructure.Services;

public class TaskService : ITaskService
{
    private readonly AppDbContext _context;

    public TaskService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<ProjectTaskResponseDto>> GetAllAsync(string tenantId)
    {
        var tasks = await _context.ProjectTasks.Where(t => t.TenantId == tenantId).ToListAsync();
        return tasks.Select(MapToResponseDto);
    }

    public async Task<IEnumerable<ProjectTaskResponseDto>> GetByProjectAsync(string projectId, string tenantId)
    {
        var tasks = await _context.ProjectTasks.Where(t => t.ProjectId == projectId && t.TenantId == tenantId).ToListAsync();
        return tasks.Select(MapToResponseDto);
    }

    public async Task<ProjectTaskResponseDto?> GetByIdAsync(string id, string tenantId)
    {
        var t = await _context.ProjectTasks.FirstOrDefaultAsync(x => x.Id == id && x.TenantId == tenantId);
        return t == null ? null : MapToResponseDto(t);
    }

    public async Task<ProjectTaskResponseDto> CreateAsync(CreateProjectTaskDto dto, string tenantId, string userId)
    {
        var task = new ProjectTask
        {
            Id = UlidGenerator.Generate(),
            TaskCode = dto.TaskCode,
            Name = dto.Name,
            Description = dto.Description,
            ProjectId = dto.ProjectId,
            ProjectPhaseId = dto.ProjectPhaseId,
            AssignedToId = dto.AssignedToId,
            AssignedToType = dto.AssignedToType,
            ExternalAssigneeId = dto.ExternalAssigneeId,
            PlannedStartDate = dto.PlannedStartDate,
            PlannedEndDate = dto.PlannedEndDate,
            DurationDays = dto.DurationDays,
            EstimatedHours = dto.EstimatedHours,
            EstimatedCost = dto.EstimatedCost,
            Priority = dto.Priority,
            IsCriticalPath = dto.IsCriticalPath,
            RequiresQualityCheck = dto.RequiresQualityCheck,
            TenantId = tenantId,
            CreatedBy = userId,
            CreatedAt = DateTime.UtcNow,
            IsActive = true
        };

        _context.ProjectTasks.Add(task);
        await _context.SaveChangesAsync();
        return MapToResponseDto(task);
    }

    public async Task<ProjectTaskResponseDto?> UpdateAsync(string id, UpdateProjectTaskDto dto, string tenantId, string userId)
    {
        var task = await _context.ProjectTasks.FirstOrDefaultAsync(t => t.Id == id && t.TenantId == tenantId);
        if (task == null) return null;

        task.Name = dto.Name ?? task.Name;
        task.Description = dto.Description ?? task.Description;
        task.ProjectPhaseId = dto.ProjectPhaseId ?? task.ProjectPhaseId;
        task.AssignedToId = dto.AssignedToId ?? task.AssignedToId;
        task.AssignedToType = dto.AssignedToType ?? task.AssignedToType;
        task.ExternalAssigneeId = dto.ExternalAssigneeId ?? task.ExternalAssigneeId;
        task.PlannedStartDate = dto.PlannedStartDate ?? task.PlannedStartDate;
        task.PlannedEndDate = dto.PlannedEndDate ?? task.PlannedEndDate;
        task.ActualStartDate = dto.ActualStartDate ?? task.ActualStartDate;
        task.ActualEndDate = dto.ActualEndDate ?? task.ActualEndDate;
        task.DurationDays = dto.DurationDays ?? task.DurationDays;
        task.EstimatedHours = dto.EstimatedHours ?? task.EstimatedHours;
        task.ActualHours = dto.ActualHours ?? task.ActualHours;
        task.EstimatedCost = dto.EstimatedCost ?? task.EstimatedCost;
        task.ActualCost = dto.ActualCost ?? task.ActualCost;
        task.Status = dto.Status ?? task.Status;
        task.ProgressPercentage = dto.ProgressPercentage ?? task.ProgressPercentage;
        task.Priority = dto.Priority ?? task.Priority;
        task.IsCriticalPath = dto.IsCriticalPath ?? task.IsCriticalPath;
        task.RequiresQualityCheck = dto.RequiresQualityCheck ?? task.RequiresQualityCheck;
        task.QualityCheckPassed = dto.QualityCheckPassed ?? task.QualityCheckPassed;
        task.QualityCheckDate = dto.QualityCheckDate ?? task.QualityCheckDate;
        task.QualityCheckedBy = dto.QualityCheckedBy ?? task.QualityCheckedBy;
        task.IsActive = dto.IsActive ?? task.IsActive;
        task.UpdatedAt = DateTime.UtcNow;
        task.UpdatedBy = userId;

        await _context.SaveChangesAsync();
        return MapToResponseDto(task);
    }

    public async Task<bool> DeleteAsync(string id, string tenantId)
    {
        var task = await _context.ProjectTasks.FirstOrDefaultAsync(t => t.Id == id && t.TenantId == tenantId);
        if (task == null) return false;
        _context.ProjectTasks.Remove(task);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<TaskDependencyResponseDto> AddDependencyAsync(CreateTaskDependencyDto dto, string tenantId, string userId)
    {
        var dep = new TaskDependency
        {
            Id = UlidGenerator.Generate(),
            PredecessorTaskId = dto.PredecessorTaskId,
            SuccessorTaskId = dto.SuccessorTaskId,
            DependencyType = dto.DependencyType,
            LagDays = dto.LagDays,
            TenantId = tenantId,
            CreatedBy = userId,
            CreatedAt = DateTime.UtcNow
        };

        _context.TaskDependencies.Add(dep);
        await _context.SaveChangesAsync();

        // Simplified response values
        return new TaskDependencyResponseDto(dep.Id, dep.PredecessorTaskId, null, null, dep.SuccessorTaskId, null, null, dep.DependencyType, dep.LagDays);
    }

    public async Task<bool> RemoveDependencyAsync(string id, string tenantId)
    {
        var dep = await _context.TaskDependencies.FirstOrDefaultAsync(d => d.Id == id && d.TenantId == tenantId);
        if (dep == null) return false;
        _context.TaskDependencies.Remove(dep);
        await _context.SaveChangesAsync();
        return true;
    }

    private static ProjectTaskResponseDto MapToResponseDto(ProjectTask t)
    {
        return new ProjectTaskResponseDto(
            t.Id,
            t.TaskCode,
            t.Name,
            t.Description,
            t.ProjectId,
            t.ProjectPhaseId,
            null,
            t.AssignedToId,
            null,
            t.AssignedToType,
            t.ExternalAssigneeId,
            t.PlannedStartDate,
            t.PlannedEndDate,
            t.ActualStartDate,
            t.ActualEndDate,
            t.DurationDays,
            t.EstimatedHours,
            t.ActualHours,
            t.EstimatedCost,
            t.ActualCost,
            t.Status,
            t.ProgressPercentage,
            t.Priority,
            t.IsCriticalPath,
            t.RequiresQualityCheck,
            t.QualityCheckPassed,
            t.QualityCheckDate,
            t.QualityCheckedBy,
            t.IsActive,
            t.CreatedAt,
            t.UpdatedAt
        );
    }
}