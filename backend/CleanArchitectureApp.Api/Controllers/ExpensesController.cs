using System.Security.Claims;
using CleanArchitectureApp.Application.DTOs;
using CleanArchitectureApp.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CleanArchitectureApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ExpensesController : ControllerBase
{
    private readonly IExpenseService _expenseService;

    public ExpensesController(IExpenseService expenseService)
    {
        _expenseService = expenseService;
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

    // Heads
    [HttpGet("heads")]
    public async Task<ActionResult<IEnumerable<ExpenseHeadResponseDto>>> GetHeads()
    {
        var heads = await _expenseService.GetHeadsAsync(GetTenantId());
        return Ok(heads);
    }

    [HttpPost("heads")]
    public async Task<ActionResult<ExpenseHeadResponseDto>> CreateHead([FromBody] CreateExpenseHeadDto dto)
    {
        var head = await _expenseService.CreateHeadAsync(dto, GetTenantId());
        return Ok(head);
    }

    // Expenses
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ExpenseResponseDto>>> GetAll()
    {
        var expenses = await _expenseService.GetAllAsync(GetTenantId());
        return Ok(expenses);
    }

    [HttpGet("project/{projectId}")]
    public async Task<ActionResult<IEnumerable<ExpenseResponseDto>>> GetByProject(string projectId)
    {
        var expenses = await _expenseService.GetByProjectAsync(projectId, GetTenantId());
        return Ok(expenses);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ExpenseResponseDto>> GetById(string id)
    {
        var expense = await _expenseService.GetByIdAsync(id, GetTenantId());
        if (expense == null) return NotFound();
        return Ok(expense);
    }

    [HttpPost]
    public async Task<ActionResult<ExpenseResponseDto>> Create([FromBody] CreateExpenseDto dto)
    {
        var expense = await _expenseService.CreateAsync(dto, GetTenantId(), GetUserId());
        return CreatedAtAction(nameof(GetById), new { id = expense.Id }, expense);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ExpenseResponseDto>> Update(string id, [FromBody] UpdateExpenseDto dto)
    {
        var expense = await _expenseService.UpdateAsync(id, dto, GetTenantId(), GetUserId());
        if (expense == null) return NotFound();
        return Ok(expense);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(string id)
    {
        var result = await _expenseService.DeleteAsync(id, GetTenantId());
        if (!result) return NotFound();
        return NoContent();
    }

    [HttpPost("{id}/approve")]
    public async Task<ActionResult> Approve(string id)
    {
        var result = await _expenseService.ApproveAsync(id, GetTenantId(), GetUserId());
        if (!result) return NotFound();
        return Ok();
    }
}
