using System.Security.Claims;
using CleanArchitectureApp.Application.DTOs;
using CleanArchitectureApp.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CleanArchitectureApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class InventoryController : ControllerBase
{
    private readonly IInventoryService _inventoryService;

    public InventoryController(IInventoryService inventoryService)
    {
        _inventoryService = inventoryService;
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

    [HttpGet("site/{siteId}")]
    public async Task<ActionResult<IEnumerable<InventoryResponseDto>>> GetStockBySite(string siteId)
    {
        var stock = await _inventoryService.GetStockBySiteAsync(siteId, GetTenantId());
        return Ok(stock);
    }

    [HttpGet("site/{siteId}/item/{itemId}")]
    public async Task<ActionResult<InventoryResponseDto>> GetItemStock(string siteId, string itemId)
    {
        var stock = await _inventoryService.GetItemStockAsync(siteId, itemId, GetTenantId());
        if (stock == null) return NotFound();
        return Ok(stock);
    }

    [HttpPost("transaction")]
    public async Task<ActionResult<TransactionResponseDto>> ProcessTransaction([FromBody] CreateTransactionDto dto)
    {
        try
        {
            var transaction = await _inventoryService.ProcessTransactionAsync(dto, GetTenantId(), GetUserId());
            return Ok(transaction);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("transactions/site/{siteId}")]
    public async Task<ActionResult<IEnumerable<TransactionResponseDto>>> GetTransactionsBySite(string siteId)
    {
        var transactions = await _inventoryService.GetTransactionsBySiteAsync(siteId, GetTenantId());
        return Ok(transactions);
    }
}
