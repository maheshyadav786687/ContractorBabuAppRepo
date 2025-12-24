using System.Collections.Generic;
using CleanArchitectureApp.Application.DTOs;
using CleanArchitectureApp.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CleanArchitectureApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ReportingController : ControllerBase
{
    private readonly IReportingService _reportingService;

    public ReportingController(IReportingService reportingService)
    {
        _reportingService = reportingService;
    }

    private string GetTenantId()
    {
        var tenantIdClaim = User.FindFirst("TenantId")?.Value;
        return tenantIdClaim ?? "";
    }

    // GET api/reporting/project/{projectId}
    [HttpGet("project/{projectId}")]
    public async Task<ActionResult<ProjectCostReportDto>> GetProjectReport(string projectId)
    {
        var report = await _reportingService.GetProjectCostReportAsync(projectId, GetTenantId());
        return Ok(report);
    }

    // GET api/reporting/projects
    [HttpGet("projects")]
    public async Task<ActionResult<IEnumerable<ProjectCostReportDto>>> GetAllProjectReports()
    {
        var reports = await _reportingService.GetAllProjectCostReportsAsync(GetTenantId());
        return Ok(reports);
    }

    // GET api/reporting/client/{clientId}
    [HttpGet("client/{clientId}")]
    public async Task<ActionResult<ClientBillingReportDto>> GetClientReport(string clientId)
    {
        var report = await _reportingService.GetClientBillingReportAsync(clientId, GetTenantId());
        return Ok(report);
    }

    // GET api/reporting/clients
    [HttpGet("clients")]
    public async Task<ActionResult<IEnumerable<ClientBillingReportDto>>> GetAllClientReports()
    {
        var reports = await _reportingService.GetAllClientBillingReportsAsync(GetTenantId());
        return Ok(reports);
    }

    // GET api/reporting/payroll/{laborId}
    [HttpGet("payroll/{laborId}")]
    public async Task<ActionResult<PayrollSummaryDto>> GetPayrollReport(string laborId)
    {
        var report = await _reportingService.GetPayrollSummaryAsync(laborId, GetTenantId());
        return Ok(report);
    }

    // GET api/reporting/payrolls
    [HttpGet("payrolls")]
    public async Task<ActionResult<IEnumerable<PayrollSummaryDto>>> GetAllPayrollReports()
    {
        var reports = await _reportingService.GetAllPayrollSummariesAsync(GetTenantId());
        return Ok(reports);
    }
}
