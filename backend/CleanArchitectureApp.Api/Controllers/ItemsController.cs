using System.Security.Claims;
using CleanArchitectureApp.Application.DTOs;
using CleanArchitectureApp.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CleanArchitectureApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ItemsController : ControllerBase
{
    private readonly IItemService _itemService;

    public ItemsController(IItemService itemService)
    {
        _itemService = itemService;
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
    public async Task<ActionResult<IEnumerable<ItemResponseDto>>> GetAll()
    {
        var items = await _itemService.GetAllAsync(GetTenantId());
        return Ok(items);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ItemResponseDto>> GetById(string id)
    {
        var item = await _itemService.GetByIdAsync(id, GetTenantId());
        if (item == null) return NotFound();
        return Ok(item);
    }

    [HttpPost]
    public async Task<ActionResult<ItemResponseDto>> Create([FromBody] CreateItemDto dto)
    {
        var item = await _itemService.CreateAsync(dto, GetTenantId(), GetUserId());
        return CreatedAtAction(nameof(GetById), new { id = item.Id }, item);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ItemResponseDto>> Update(string id, [FromBody] UpdateItemDto dto)
    {
        var item = await _itemService.UpdateAsync(id, dto, GetTenantId(), GetUserId());
        if (item == null) return NotFound();
        return Ok(item);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(string id)
    {
        var result = await _itemService.DeleteAsync(id, GetTenantId());
        if (!result) return NotFound();
        return NoContent();
    }
}
