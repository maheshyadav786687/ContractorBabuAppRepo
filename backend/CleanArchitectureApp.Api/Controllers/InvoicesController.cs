using System.Security.Claims;
using CleanArchitectureApp.Application.DTOs;
using CleanArchitectureApp.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CleanArchitectureApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class InvoicesController : ControllerBase
{
    private readonly IInvoiceService _invoiceService;

    public InvoicesController(IInvoiceService invoiceService)
    {
        _invoiceService = invoiceService;
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
    public async Task<ActionResult<IEnumerable<InvoiceResponseDto>>> GetAll()
    {
        var invoices = await _invoiceService.GetAllAsync(GetTenantId());
        return Ok(invoices);
    }

    [HttpGet("project/{projectId}")]
    public async Task<ActionResult<IEnumerable<InvoiceResponseDto>>> GetByProject(string projectId)
    {
        var invoices = await _invoiceService.GetByProjectAsync(projectId, GetTenantId());
        return Ok(invoices);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<InvoiceResponseDto>> GetById(string id)
    {
        var invoice = await _invoiceService.GetByIdAsync(id, GetTenantId());
        if (invoice == null) return NotFound();
        return Ok(invoice);
    }

    [HttpPost]
    public async Task<ActionResult<InvoiceResponseDto>> Create([FromBody] CreateInvoiceDto dto)
    {
        var invoice = await _invoiceService.CreateAsync(dto, GetTenantId(), GetUserId());
        return CreatedAtAction(nameof(GetById), new { id = invoice.Id }, invoice);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<InvoiceResponseDto>> Update(string id, [FromBody] UpdateInvoiceDto dto)
    {
        var invoice = await _invoiceService.UpdateAsync(id, dto, GetTenantId(), GetUserId());
        if (invoice == null) return NotFound();
        return Ok(invoice);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(string id)
    {
        var result = await _invoiceService.DeleteAsync(id, GetTenantId());
        if (!result) return NotFound();
        return NoContent();
    }
}
