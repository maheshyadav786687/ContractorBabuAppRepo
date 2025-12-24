using System.Security.Claims;
using CleanArchitectureApp.Application.DTOs;
using CleanArchitectureApp.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CleanArchitectureApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProjectsController : ControllerBase
{
    private readonly IProjectService _projectService;

    public ProjectsController(IProjectService projectService)
    {
        _projectService = projectService;
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

    // Projects
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProjectResponseDto>>> GetAll()
    {
        var projects = await _projectService.GetAllAsync(GetTenantId());
        return Ok(projects);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ProjectResponseDto>> GetById(string id)
    {
        var project = await _projectService.GetByIdAsync(id, GetTenantId());
        if (project == null) return NotFound();
        return Ok(project);
    }

    [HttpPost]
    public async Task<ActionResult<ProjectResponseDto>> Create([FromBody] CreateProjectDto dto)
    {
        var project = await _projectService.CreateAsync(dto, GetTenantId(), GetUserId());
        return CreatedAtAction(nameof(GetById), new { id = project.Id }, project);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ProjectResponseDto>> Update(string id, [FromBody] UpdateProjectDto dto)
    {
        var project = await _projectService.UpdateAsync(id, dto, GetTenantId(), GetUserId());
        if (project == null) return NotFound();
        return Ok(project);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(string id)
    {
        var result = await _projectService.DeleteAsync(id, GetTenantId());
        if (!result) return NotFound();
        return NoContent();
    }

    // Project Phases
    [HttpGet("{projectId}/phases")]
    public async Task<ActionResult<IEnumerable<ProjectPhaseResponseDto>>> GetPhases(string projectId)
    {
        var phases = await _projectService.GetPhasesAsync(projectId, GetTenantId());
        return Ok(phases);
    }

    [HttpGet("phases/{id}")]
    public async Task<ActionResult<ProjectPhaseResponseDto>> GetPhaseById(string id)
    {
        var phase = await _projectService.GetPhaseByIdAsync(id, GetTenantId());
        if (phase == null) return NotFound();
        return Ok(phase);
    }

    [HttpPost("phases")]
    public async Task<ActionResult<ProjectPhaseResponseDto>> CreatePhase([FromBody] CreateProjectPhaseDto dto)
    {
        var phase = await _projectService.CreatePhaseAsync(dto, GetTenantId(), GetUserId());
        return CreatedAtAction(nameof(GetPhaseById), new { id = phase.Id }, phase);
    }

    [HttpPut("phases/{id}")]
    public async Task<ActionResult<ProjectPhaseResponseDto>> UpdatePhase(string id, [FromBody] UpdateProjectPhaseDto dto)
    {
        var phase = await _projectService.UpdatePhaseAsync(id, dto, GetTenantId(), GetUserId());
        if (phase == null) return NotFound();
        return Ok(phase);
    }

    [HttpDelete("phases/{id}")]
    public async Task<ActionResult> DeletePhase(string id)
    {
        var result = await _projectService.DeletePhaseAsync(id, GetTenantId());
        if (!result) return NotFound();
        return NoContent();
    }
}
