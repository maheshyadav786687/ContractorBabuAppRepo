using CleanArchitectureApp.Application.DTOs;

namespace CleanArchitectureApp.Application.Interfaces;

public interface IProjectService
{
    // Projects
    Task<IEnumerable<ProjectResponseDto>> GetAllAsync(string tenantId);
    Task<ProjectResponseDto?> GetByIdAsync(string id, string tenantId);
    Task<ProjectResponseDto> CreateAsync(CreateProjectDto dto, string tenantId, string userId);
    Task<ProjectResponseDto?> UpdateAsync(string id, UpdateProjectDto dto, string tenantId, string userId);
    Task<bool> DeleteAsync(string id, string tenantId);
    
    // Project Phases
    Task<IEnumerable<ProjectPhaseResponseDto>> GetPhasesAsync(string projectId, string tenantId);
    Task<ProjectPhaseResponseDto?> GetPhaseByIdAsync(string id, string tenantId);
    Task<ProjectPhaseResponseDto> CreatePhaseAsync(CreateProjectPhaseDto dto, string tenantId, string userId);
    Task<ProjectPhaseResponseDto?> UpdatePhaseAsync(string id, UpdateProjectPhaseDto dto, string tenantId, string userId);
    Task<bool> DeletePhaseAsync(string id, string tenantId);
}
