using CleanArchitectureApp.Application.DTOs;
using CleanArchitectureApp.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CleanArchitectureApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TenantsController : ControllerBase
{
    private readonly ITenantService _tenantService;

    public TenantsController(ITenantService tenantService)
    {
        _tenantService = tenantService;
    }

    /// <summary>
    /// Get all tenants (Admin only)
    /// </summary>
    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<IEnumerable<TenantResponseDto>>> GetAll()
    {
        var tenants = await _tenantService.GetAllTenantsAsync();
        return Ok(tenants);
    }

    /// <summary>
    /// Get tenant by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<TenantResponseDto>> GetById(string id)
    {
        var tenant = await _tenantService.GetTenantByIdAsync(id);
        if (tenant == null)
        {
            return NotFound(new { message = "Tenant not found" });
        }
        return Ok(tenant);
    }

    /// <summary>
    /// Create new tenant
    /// </summary>
    [HttpPost]
    [AllowAnonymous] // Allow tenant registration without authentication
    public async Task<ActionResult<TenantResponseDto>> Create([FromBody] CreateTenantDto dto)
    {
        try
        {
            var tenant = await _tenantService.CreateTenantAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = tenant.Id }, tenant);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Update tenant information
    /// </summary>
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<TenantResponseDto>> Update(string id, [FromBody] UpdateTenantDto dto)
    {
        try
        {
            var tenant = await _tenantService.UpdateTenantAsync(id, dto);
            return Ok(tenant);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Delete (deactivate) tenant
    /// </summary>
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> Delete(string id)
    {
        var result = await _tenantService.DeleteTenantAsync(id);
        if (!result)
        {
            return NotFound(new { message = "Tenant not found" });
        }
        return NoContent();
    }
}
