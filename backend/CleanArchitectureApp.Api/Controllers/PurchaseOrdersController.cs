using System.Security.Claims;
using CleanArchitectureApp.Application.DTOs;
using CleanArchitectureApp.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CleanArchitectureApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PurchaseOrdersController : ControllerBase
{
    private readonly IPurchaseOrderService _poService;

    public PurchaseOrdersController(IPurchaseOrderService poService)
    {
        _poService = poService;
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
    public async Task<ActionResult<IEnumerable<PurchaseOrderResponseDto>>> GetAll()
    {
        var pos = await _poService.GetAllAsync(GetTenantId());
        return Ok(pos);
    }

    [HttpGet("project/{projectId}")]
    public async Task<ActionResult<IEnumerable<PurchaseOrderResponseDto>>> GetByProject(string projectId)
    {
        var pos = await _poService.GetByProjectAsync(projectId, GetTenantId());
        return Ok(pos);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<PurchaseOrderResponseDto>> GetById(string id)
    {
        var po = await _poService.GetByIdAsync(id, GetTenantId());
        if (po == null) return NotFound();
        return Ok(po);
    }

    [HttpPost]
    public async Task<ActionResult<PurchaseOrderResponseDto>> Create([FromBody] CreatePurchaseOrderDto dto)
    {
        var po = await _poService.CreateAsync(dto, GetTenantId(), GetUserId());
        return CreatedAtAction(nameof(GetById), new { id = po.Id }, po);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<PurchaseOrderResponseDto>> Update(string id, [FromBody] UpdatePurchaseOrderDto dto)
    {
        var po = await _poService.UpdateAsync(id, dto, GetTenantId(), GetUserId());
        if (po == null) return NotFound();
        return Ok(po);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(string id)
    {
        var result = await _poService.DeleteAsync(id, GetTenantId());
        if (!result) return NotFound();
        return NoContent();
    }
}
