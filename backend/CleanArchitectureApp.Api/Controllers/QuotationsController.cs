using System.Security.Claims;
using CleanArchitectureApp.Application.DTOs;
using CleanArchitectureApp.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CleanArchitectureApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class QuotationsController : ControllerBase
{
    private readonly IQuotationService _quotationService;

    public QuotationsController(IQuotationService quotationService)
    {
        _quotationService = quotationService;
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
    public async Task<ActionResult<IEnumerable<QuotationResponseDto>>> GetAll()
    {
        var quotations = await _quotationService.GetAllAsync(GetTenantId());
        return Ok(quotations);
    }

    [HttpGet("next-number")]
    public async Task<ActionResult<string>> GetNextNumber()
    {
        var number = await _quotationService.GetNextQuotationNumberAsync(GetTenantId());
        return Ok(new { number });
    }

    [HttpGet("project/{projectId}")]
    public async Task<ActionResult<IEnumerable<QuotationResponseDto>>> GetByProject(string projectId)
    {
        var quotations = await _quotationService.GetByProjectAsync(projectId, GetTenantId());
        return Ok(quotations);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<QuotationResponseDto>> GetById(string id)
    {
        var quotation = await _quotationService.GetByIdAsync(id, GetTenantId());
        if (quotation == null) return NotFound();
        return Ok(quotation);
    }

    [HttpPost]
    public async Task<ActionResult<QuotationResponseDto>> Create([FromBody] CreateQuotationDto dto)
    {
        var quotation = await _quotationService.CreateAsync(dto, GetTenantId(), GetUserId());
        return CreatedAtAction(nameof(GetById), new { id = quotation.Id }, quotation);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<QuotationResponseDto>> Update(string id, [FromBody] UpdateQuotationDto dto)
    {
        var quotation = await _quotationService.UpdateAsync(id, dto, GetTenantId(), GetUserId());
        if (quotation == null) return NotFound();
        return Ok(quotation);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(string id)
    {
        var result = await _quotationService.DeleteAsync(id, GetTenantId());
        if (!result) return NotFound();
        return NoContent();
    }

    // Quotation Items
    [HttpPost("{id}/items")]
    public async Task<ActionResult<QuotationItemResponseDto>> AddItem(string id, [FromBody] CreateQuotationItemDto dto)
    {
        var item = await _quotationService.AddItemAsync(id, dto, GetTenantId(), GetUserId());
        return Ok(item);
    }

    [HttpPut("items/{itemId}")]
    public async Task<ActionResult<QuotationItemResponseDto>> UpdateItem(string itemId, [FromBody] UpdateQuotationItemDto dto)
    {
        var item = await _quotationService.UpdateItemAsync(itemId, dto, GetTenantId(), GetUserId());
        if (item == null) return NotFound();
        return Ok(item);
    }

    [HttpDelete("items/{itemId}")]
    public async Task<ActionResult> RemoveItem(string itemId)
    {
        var result = await _quotationService.RemoveItemAsync(itemId, GetTenantId());
        if (!result) return NotFound();
        return NoContent();
    }
}
