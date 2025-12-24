using System.Security.Claims;
using CleanArchitectureApp.Application.DTOs;
using CleanArchitectureApp.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CleanArchitectureApp.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class SitesController : ControllerBase
{
    private readonly ISiteService _siteService;

    public SitesController(ISiteService siteService)
    {
        _siteService = siteService;
    }

    private string GetCurrentTenantId()
    {
        var tenantIdClaim = User.FindFirst("TenantId")?.Value;
        return tenantIdClaim ?? "";
    }

    private string GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return userIdClaim ?? "";
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<SiteDto>>> GetSites()
    {
        var tenantId = GetCurrentTenantId();
        var sites = await _siteService.GetAllSitesAsync(tenantId);
        return Ok(sites);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<SiteDto>> GetSite(string id)
    {
        var tenantId = GetCurrentTenantId();
        var site = await _siteService.GetSiteByIdAsync(id, tenantId);
        if (site == null)
        {
            return NotFound();
        }
        return Ok(site);
    }

    [HttpGet("client/{clientId}")]
    public async Task<ActionResult<IEnumerable<SiteDto>>> GetSitesByClient(string clientId)
    {
        var tenantId = GetCurrentTenantId();
        var sites = await _siteService.GetSitesByClientIdAsync(clientId, tenantId);
        return Ok(sites);
    }

    [HttpPost]
    public async Task<ActionResult<SiteDto>> CreateSite(CreateSiteDto createSiteDto)
    {
        try
        {
            var tenantId = GetCurrentTenantId();
            var userId = GetCurrentUserId();
            var site = await _siteService.CreateSiteAsync(createSiteDto, tenantId, userId);
            
            return CreatedAtAction(nameof(GetSite), new { id = site.Id }, site);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<SiteDto>> UpdateSite(string id, UpdateSiteDto updateSiteDto)
    {
        var tenantId = GetCurrentTenantId();
        var userId = GetCurrentUserId();
        var site = await _siteService.UpdateSiteAsync(id, updateSiteDto, tenantId, userId);
        
        if (site == null)
        {
            return NotFound();
        }
        
        return Ok(site);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteSite(string id)
    {
        var tenantId = GetCurrentTenantId();
        var result = await _siteService.DeleteSiteAsync(id, tenantId);
        if (!result)
        {
            return NotFound();
        }
        return NoContent();
    }
}
