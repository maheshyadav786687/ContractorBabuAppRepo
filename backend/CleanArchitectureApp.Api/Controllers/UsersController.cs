using CleanArchitectureApp.Application.DTOs;
using CleanArchitectureApp.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace CleanArchitectureApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    /// <summary>
    /// Get current user's tenant ID from JWT token
    /// </summary>
    private string GetTenantId()
    {
        var tenantIdClaim = User.FindFirst("TenantId")?.Value;
        return tenantIdClaim ?? "";
    }

    /// <summary>
    /// Get all users in the current tenant
    /// </summary>
    [HttpGet]
    [Authorize(Roles = "Admin,ProjectManager")]
    public async Task<ActionResult<IEnumerable<UserResponseDto>>> GetAll()
    {
        var tenantId = GetTenantId();
        var users = await _userService.GetUsersByTenantAsync(tenantId);
        return Ok(users);
    }

    /// <summary>
    /// Get user by ID within the current tenant
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<UserResponseDto>> GetById(string id)
    {
        var tenantId = GetTenantId();
        var user = await _userService.GetUserByIdAsync(id, tenantId);
        
        if (user == null)
        {
            return NotFound(new { message = "User not found" });
        }
        
        return Ok(user);
    }

    /// <summary>
    /// Create new user in the current tenant
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<UserResponseDto>> Create([FromBody] CreateUserDto dto)
    {
        try
        {
            var tenantId = GetTenantId();
            var user = await _userService.CreateUserAsync(dto, tenantId);
            return CreatedAtAction(nameof(GetById), new { id = user.Id }, user);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Update user information
    /// </summary>
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<UserResponseDto>> Update(string id, [FromBody] UpdateUserDto dto)
    {
        try
        {
            var tenantId = GetTenantId();
            var user = await _userService.UpdateUserAsync(id, dto, tenantId);
            return Ok(user);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Delete (deactivate) user
    /// </summary>
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> Delete(string id)
    {
        var tenantId = GetTenantId();
        var result = await _userService.DeleteUserAsync(id, tenantId);
        
        if (!result)
        {
            return NotFound(new { message = "User not found" });
        }
        
        return NoContent();
    }
}
