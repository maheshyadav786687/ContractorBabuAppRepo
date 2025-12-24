using CleanArchitectureApp.Application.DTOs;

namespace CleanArchitectureApp.Application.Interfaces;

public interface ITaskService
{
    Task<IEnumerable<ProjectTaskResponseDto>> GetAllAsync(string tenantId);
    Task<IEnumerable<ProjectTaskResponseDto>> GetByProjectAsync(string projectId, string tenantId);
    Task<ProjectTaskResponseDto?> GetByIdAsync(string id, string tenantId);
    Task<ProjectTaskResponseDto> CreateAsync(CreateProjectTaskDto dto, string tenantId, string userId);
    Task<ProjectTaskResponseDto?> UpdateAsync(string id, UpdateProjectTaskDto dto, string tenantId, string userId);
    Task<bool> DeleteAsync(string id, string tenantId);
    
    // Dependencies
    Task<TaskDependencyResponseDto> AddDependencyAsync(CreateTaskDependencyDto dto, string tenantId, string userId);
    Task<bool> RemoveDependencyAsync(string id, string tenantId);
}
