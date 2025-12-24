using System.Security.Claims;
using CleanArchitectureApp.Application.DTOs;
using CleanArchitectureApp.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CleanArchitectureApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ClientsController : ControllerBase
{
    private readonly IClientService _clientService;

    public ClientsController(IClientService clientService)
    {
        _clientService = clientService;
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
    public async Task<ActionResult<IEnumerable<ClientResponseDto>>> GetAll()
    {
        var clients = await _clientService.GetAllAsync(GetTenantId());
        return Ok(clients);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ClientResponseDto>> GetById(string id)
    {
        var client = await _clientService.GetByIdAsync(id, GetTenantId());
        if (client == null) return NotFound();
        return Ok(client);
    }

    [HttpPost]
    public async Task<ActionResult<ClientResponseDto>> Create([FromBody] CreateClientDto dto)
    {
        var client = await _clientService.CreateAsync(dto, GetTenantId(), GetUserId());
        return CreatedAtAction(nameof(GetById), new { id = client.Id }, client);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ClientResponseDto>> Update(string id, [FromBody] UpdateClientDto dto)
    {
        var client = await _clientService.UpdateAsync(id, dto, GetTenantId(), GetUserId());
        if (client == null) return NotFound();
        return Ok(client);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(string id)
    {
        var result = await _clientService.DeleteAsync(id, GetTenantId());
        if (!result) return NotFound();
        return NoContent();
    }
}
