using CleanArchitectureApp.Application.DTOs;
using CleanArchitectureApp.Application.Interfaces;
using CleanArchitectureApp.Domain.Entities;
using CleanArchitectureApp.Infrastructure.Data;
using CleanArchitectureApp.Infrastructure.Helpers;
using Microsoft.EntityFrameworkCore;

namespace CleanArchitectureApp.Infrastructure.Services;

public class ProjectService : IProjectService
{
    private readonly AppDbContext _context;

    public ProjectService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<ProjectResponseDto>> GetAllAsync(string tenantId)
    {
        var projects = await _context.Projects
            .Include(p => p.Client)
            .Include(p => p.Site)
            .Include(p => p.ProjectManager)
            .Where(p => p.TenantId == tenantId)
            .ToListAsync();
        return projects.Select(MapToResponseDto);
    }

    public async Task<ProjectResponseDto?> GetByIdAsync(string id, string tenantId)
    {
        var p = await _context.Projects
            .Include(p => p.Client)
            .Include(p => p.Site)
            .Include(p => p.ProjectManager)
            .FirstOrDefaultAsync(x => x.Id == id && x.TenantId == tenantId);
        return p == null ? null : MapToResponseDto(p);
    }

    public async Task<ProjectResponseDto> CreateAsync(CreateProjectDto dto, string tenantId, string userId)
    {
        var project = new Project
        {
            Id = UlidGenerator.Generate(),
            ProjectCode = dto.ProjectCode,
            Name = dto.Name,
            Description = dto.Description,
            ClientId = dto.ClientId,
            SiteId = dto.SiteId,
            ProjectManagerId = dto.ProjectManagerId,
            ProjectType = dto.ProjectType,
            EstimatedBudget = dto.EstimatedBudget,
            StartDate = dto.StartDate,
            PlannedEndDate = dto.PlannedEndDate,
            ContractType = dto.ContractType,
            ContractValue = dto.ContractValue,
            TenantId = tenantId,
            CreatedBy = userId,
            CreatedAt = DateTime.UtcNow,
            IsActive = true
        };

        _context.Projects.Add(project);
        await _context.SaveChangesAsync();
        return MapToResponseDto(project);
    }

    public async Task<ProjectResponseDto?> UpdateAsync(string id, UpdateProjectDto dto, string tenantId, string userId)
    {
        var project = await _context.Projects.FirstOrDefaultAsync(p => p.Id == id && p.TenantId == tenantId);
        if (project == null) return null;

        project.Name = dto.Name ?? project.Name;
        project.Description = dto.Description ?? project.Description;
        project.SiteId = dto.SiteId ?? project.SiteId;
        project.ProjectManagerId = dto.ProjectManagerId ?? project.ProjectManagerId;
        project.ProjectType = dto.ProjectType ?? project.ProjectType;
        project.EstimatedBudget = dto.EstimatedBudget ?? project.EstimatedBudget;
        project.ActualCost = dto.ActualCost ?? project.ActualCost;
        project.StartDate = dto.StartDate ?? project.StartDate;
        project.PlannedEndDate = dto.PlannedEndDate ?? project.PlannedEndDate;
        project.ActualEndDate = dto.ActualEndDate ?? project.ActualEndDate;
        project.Status = dto.Status ?? project.Status;
        project.ProgressPercentage = dto.ProgressPercentage ?? project.ProgressPercentage;
        project.ContractType = dto.ContractType ?? project.ContractType;
        project.ContractValue = dto.ContractValue ?? project.ContractValue;
        project.IsActive = dto.IsActive ?? project.IsActive;
        project.UpdatedAt = DateTime.UtcNow;
        project.UpdatedBy = userId;

        await _context.SaveChangesAsync();
        return MapToResponseDto(project);
    }

    public async Task<bool> DeleteAsync(string id, string tenantId)
    {
        var project = await _context.Projects.FirstOrDefaultAsync(p => p.Id == id && p.TenantId == tenantId);
        if (project == null) return false;
        _context.Projects.Remove(project);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<IEnumerable<ProjectPhaseResponseDto>> GetPhasesAsync(string projectId, string tenantId)
    {
        var phases = await _context.ProjectPhases.Where(pp => pp.ProjectId == projectId && pp.TenantId == tenantId).ToListAsync();
        return phases.Select(pp => new ProjectPhaseResponseDto(pp.Id, pp.ProjectId, pp.Name, pp.Description, pp.Sequence, pp.PlannedStartDate, pp.PlannedEndDate, pp.ActualStartDate, pp.ActualEndDate, pp.EstimatedCost, pp.ActualCost, pp.Status, pp.ProgressPercentage, pp.SupervisorId, null, pp.IsActive));
    }

    public async Task<ProjectPhaseResponseDto?> GetPhaseByIdAsync(string id, string tenantId)
    {
        var p = await _context.ProjectPhases.FirstOrDefaultAsync(x => x.Id == id && x.TenantId == tenantId);
        if (p == null) return null;
        return new ProjectPhaseResponseDto(p.Id, p.ProjectId, p.Name, p.Description, p.Sequence, p.PlannedStartDate, p.PlannedEndDate, p.ActualStartDate, p.ActualEndDate, p.EstimatedCost, p.ActualCost, p.Status, p.ProgressPercentage, p.SupervisorId, null, p.IsActive);
    }

    public async Task<ProjectPhaseResponseDto> CreatePhaseAsync(CreateProjectPhaseDto dto, string tenantId, string userId)
    {
        var phase = new ProjectPhase
        {
            Id = UlidGenerator.Generate(),
            ProjectId = dto.ProjectId,
            Name = dto.Name,
            Description = dto.Description,
            Sequence = dto.Sequence,
            PlannedStartDate = dto.PlannedStartDate,
            PlannedEndDate = dto.PlannedEndDate,
            EstimatedCost = dto.EstimatedCost,
            SupervisorId = dto.SupervisorId,
            TenantId = tenantId,
            CreatedBy = userId,
            CreatedAt = DateTime.UtcNow
        };

        _context.ProjectPhases.Add(phase);
        await _context.SaveChangesAsync();
        return new ProjectPhaseResponseDto(phase.Id, phase.ProjectId, phase.Name, phase.Description, phase.Sequence, phase.PlannedStartDate, phase.PlannedEndDate, phase.ActualStartDate, phase.ActualEndDate, phase.EstimatedCost, phase.ActualCost, phase.Status, phase.ProgressPercentage, phase.SupervisorId, null, phase.IsActive);
    }

    public async Task<ProjectPhaseResponseDto?> UpdatePhaseAsync(string id, UpdateProjectPhaseDto dto, string tenantId, string userId)
    {
        var phase = await _context.ProjectPhases.FirstOrDefaultAsync(p => p.Id == id && p.TenantId == tenantId);
        if (phase == null) return null;

        phase.Name = dto.Name ?? phase.Name;
        phase.Description = dto.Description ?? phase.Description;
        phase.Sequence = dto.Sequence ?? phase.Sequence;
        phase.PlannedStartDate = dto.PlannedStartDate ?? phase.PlannedStartDate;
        phase.PlannedEndDate = dto.PlannedEndDate ?? phase.PlannedEndDate;
        phase.ActualStartDate = dto.ActualStartDate ?? phase.ActualStartDate;
        phase.ActualEndDate = dto.ActualEndDate ?? phase.ActualEndDate;
        phase.EstimatedCost = dto.EstimatedCost ?? phase.EstimatedCost;
        phase.ActualCost = dto.ActualCost ?? phase.ActualCost;
        phase.Status = dto.Status ?? phase.Status;
        phase.ProgressPercentage = dto.ProgressPercentage ?? phase.ProgressPercentage;
        phase.SupervisorId = dto.SupervisorId ?? phase.SupervisorId;
        phase.IsActive = dto.IsActive ?? phase.IsActive;
        phase.UpdatedAt = DateTime.UtcNow;
        phase.UpdatedBy = userId;

        await _context.SaveChangesAsync();
        return new ProjectPhaseResponseDto(phase.Id, phase.ProjectId, phase.Name, phase.Description, phase.Sequence, phase.PlannedStartDate, phase.PlannedEndDate, phase.ActualStartDate, phase.ActualEndDate, phase.EstimatedCost, phase.ActualCost, phase.Status, phase.ProgressPercentage, phase.SupervisorId, null, phase.IsActive);
    }

    public async Task<bool> DeletePhaseAsync(string id, string tenantId)
    {
        var phase = await _context.ProjectPhases.FirstOrDefaultAsync(p => p.Id == id && p.TenantId == tenantId);
        if (phase == null) return false;
        _context.ProjectPhases.Remove(phase);
        await _context.SaveChangesAsync();
        return true;
    }

    private static ProjectResponseDto MapToResponseDto(Project p)
    {
        return new ProjectResponseDto(p.Id, p.ProjectCode, p.Name, p.Description, p.ClientId, p.Client?.Name, p.SiteId, p.Site?.Name, p.ProjectManagerId, p.ProjectManager?.FirstName + " " + p.ProjectManager?.LastName, p.ProjectType, p.EstimatedBudget, p.ActualCost, p.StartDate, p.PlannedEndDate, p.ActualEndDate, p.Status, p.ProgressPercentage, p.ContractType, p.ContractValue, p.IsActive, p.CreatedAt, p.UpdatedAt);
    }
}