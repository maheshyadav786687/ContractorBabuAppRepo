using System.Security.Claims;
using CleanArchitectureApp.Application.DTOs;
using CleanArchitectureApp.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CleanArchitectureApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class LaborController : ControllerBase
{
    private readonly ILaborService _laborService;

    public LaborController(ILaborService laborService)
    {
        _laborService = laborService;
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

    // Labor
    [HttpGet]
    public async Task<ActionResult<IEnumerable<LaborResponseDto>>> GetAll()
    {
        var labor = await _laborService.GetAllAsync(GetTenantId());
        return Ok(labor);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<LaborResponseDto>> GetById(string id)
    {
        var labor = await _laborService.GetByIdAsync(id, GetTenantId());
        if (labor == null) return NotFound();
        return Ok(labor);
    }

    [HttpPost]
    public async Task<ActionResult<LaborResponseDto>> Create([FromBody] CreateLaborDto dto)
    {
        var labor = await _laborService.CreateAsync(dto, GetTenantId(), GetUserId());
        return CreatedAtAction(nameof(GetById), new { id = labor.Id }, labor);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<LaborResponseDto>> Update(string id, [FromBody] UpdateLaborDto dto)
    {
        var labor = await _laborService.UpdateAsync(id, dto, GetTenantId(), GetUserId());
        if (labor == null) return NotFound();
        return Ok(labor);
    }

    // Attendance
    [HttpPost("attendance")]
    public async Task<ActionResult<AttendanceResponseDto>> MarkAttendance([FromBody] MarkAttendanceDto dto)
    {
        try
        {
            var attendance = await _laborService.MarkAttendanceAsync(dto, GetTenantId(), GetUserId());
            return Ok(attendance);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("attendance/site/{siteId}")]
    public async Task<ActionResult<IEnumerable<AttendanceResponseDto>>> GetAttendance(string siteId, [FromQuery] DateTime date)
    {
        var attendance = await _laborService.GetAttendanceAsync(siteId, date, GetTenantId());
        return Ok(attendance);
    }

    // Payroll
    [HttpPost("payroll")]
    public async Task<ActionResult<PayrollResponseDto>> GeneratePayroll([FromBody] CreatePayrollDto dto)
    {
        var payroll = await _laborService.GeneratePayrollAsync(dto, GetTenantId(), GetUserId());
        return Ok(payroll);
    }

    [HttpGet("payroll/labor/{laborId}")]
    public async Task<ActionResult<IEnumerable<PayrollResponseDto>>> GetPayrollHistory(string laborId)
    {
        var history = await _laborService.GetPayrollHistoryAsync(laborId, GetTenantId());
        return Ok(history);
    }
}
