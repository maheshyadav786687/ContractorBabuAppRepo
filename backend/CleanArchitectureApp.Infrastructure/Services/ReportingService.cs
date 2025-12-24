using CleanArchitectureApp.Application.DTOs;
using CleanArchitectureApp.Application.Interfaces;
using CleanArchitectureApp.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CleanArchitectureApp.Infrastructure.Services;

public class ReportingService : IReportingService
{
    private readonly AppDbContext _context;

    public ReportingService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<ProjectCostReportDto> GetProjectCostReportAsync(string projectId, string tenantId)
    {
        var expenseTotal = await _context.Expenses.Where(e => e.ProjectId == projectId && e.TenantId == tenantId).SumAsync(e => e.Amount);
        
        // project name resolved as empty
        return new ProjectCostReportDto(projectId, string.Empty, expenseTotal, 0m, 0m);
    }

    public async Task<ClientBillingReportDto> GetClientBillingReportAsync(string clientId, string tenantId)
    {
        return new ClientBillingReportDto(clientId, string.Empty, 0m, 0m);
    }

    public async Task<PayrollSummaryDto> GetPayrollSummaryAsync(string laborId, string tenantId)
    {
        var payrolls = await _context.Payrolls.Where(p => p.LaborId == laborId && p.TenantId == tenantId).ToListAsync();
        var totalWage = payrolls.Sum(p => p.TotalWageAmount);
        var totalOvertime = payrolls.Sum(p => p.TotalOvertimeHours);
        var net = payrolls.Sum(p => p.NetPayable);
        return new PayrollSummaryDto(laborId, string.Empty, totalWage, totalOvertime, net);
    }

    public async Task<IEnumerable<ProjectCostReportDto>> GetAllProjectCostReportsAsync(string tenantId)
    {
        return new List<ProjectCostReportDto>();
    }

    public async Task<IEnumerable<ClientBillingReportDto>> GetAllClientBillingReportsAsync(string tenantId)
    {
        return new List<ClientBillingReportDto>();
    }

    public async Task<IEnumerable<PayrollSummaryDto>> GetAllPayrollSummariesAsync(string tenantId)
    {
        return new List<PayrollSummaryDto>();
    }
}
