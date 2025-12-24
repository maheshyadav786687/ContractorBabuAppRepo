using System.Security.Claims;
using CleanArchitectureApp.Application.DTOs;
using CleanArchitectureApp.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CleanArchitectureApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class VendorsController : ControllerBase
{
    private readonly IVendorService _vendorService;

    public VendorsController(IVendorService vendorService)
    {
        _vendorService = vendorService;
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
    public async Task<ActionResult<IEnumerable<VendorResponseDto>>> GetAll()
    {
        var vendors = await _vendorService.GetAllAsync(GetTenantId());
        return Ok(vendors);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<VendorResponseDto>> GetById(string id)
    {
        var vendor = await _vendorService.GetByIdAsync(id, GetTenantId());
        if (vendor == null) return NotFound();
        return Ok(vendor);
    }

    [HttpPost]
    public async Task<ActionResult<VendorResponseDto>> Create([FromBody] CreateVendorDto dto)
    {
        var vendor = await _vendorService.CreateAsync(dto, GetTenantId(), GetUserId());
        return CreatedAtAction(nameof(GetById), new { id = vendor.Id }, vendor);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<VendorResponseDto>> Update(string id, [FromBody] UpdateVendorDto dto)
    {
        var vendor = await _vendorService.UpdateAsync(id, dto, GetTenantId(), GetUserId());
        if (vendor == null) return NotFound();
        return Ok(vendor);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(string id)
    {
        var result = await _vendorService.DeleteAsync(id, GetTenantId());
        if (!result) return NotFound();
        return NoContent();
    }
}
