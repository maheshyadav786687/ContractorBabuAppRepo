using System.Security.Claims;
using CleanArchitectureApp.Application.DTOs;
using CleanArchitectureApp.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CleanArchitectureApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TasksController : ControllerBase
{
    private readonly ITaskService _taskService;

    public TasksController(ITaskService taskService)
    {
        _taskService = taskService;
    }

    private string GetTenantId()
    {
        var tenantIdClaim = User.FindFirst("TenantId")?.Value;
        return tenantIdClaim ?? "";
    }

    private string GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return userIdClaim ?? "";
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProjectTaskResponseDto>>> GetAll()
    {
        var tasks = await _taskService.GetAllAsync(GetTenantId());
        return Ok(tasks);
    }

    [HttpGet("project/{projectId}")]
    public async Task<ActionResult<IEnumerable<ProjectTaskResponseDto>>> GetByProject(string projectId)
    {
        var tasks = await _taskService.GetByProjectAsync(projectId, GetTenantId());
        return Ok(tasks);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ProjectTaskResponseDto>> GetById(string id)
    {
        var task = await _taskService.GetByIdAsync(id, GetTenantId());
        if (task == null) return NotFound();
        return Ok(task);
    }

    [HttpPost]
    public async Task<ActionResult<ProjectTaskResponseDto>> Create([FromBody] CreateProjectTaskDto dto)
    {
        var task = await _taskService.CreateAsync(dto, GetTenantId(), GetUserId());
        return CreatedAtAction(nameof(GetById), new { id = task.Id }, task);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ProjectTaskResponseDto>> Update(string id, [FromBody] UpdateProjectTaskDto dto)
    {
        var task = await _taskService.UpdateAsync(id, dto, GetTenantId(), GetUserId());
        if (task == null) return NotFound();
        return Ok(task);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(string id)
    {
        var result = await _taskService.DeleteAsync(id, GetTenantId());
        if (!result) return NotFound();
        return NoContent();
    }

    // Dependencies
    [HttpPost("dependencies")]
    public async Task<ActionResult<TaskDependencyResponseDto>> AddDependency([FromBody] CreateTaskDependencyDto dto)
    {
        var dependency = await _taskService.AddDependencyAsync(dto, GetTenantId(), GetUserId());
        return Ok(dependency);
    }

    [HttpDelete("dependencies/{id}")]
    public async Task<ActionResult> RemoveDependency(string id)
    {
        var result = await _taskService.RemoveDependencyAsync(id, GetTenantId());
        if (!result) return NotFound();
        return NoContent();
    }
}
