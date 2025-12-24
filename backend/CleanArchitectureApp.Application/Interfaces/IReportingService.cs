using CleanArchitectureApp.Application.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CleanArchitectureApp.Application.Interfaces;

public interface IReportingService
{
    Task<ProjectCostReportDto> GetProjectCostReportAsync(string projectId, string tenantId);
    Task<ClientBillingReportDto> GetClientBillingReportAsync(string clientId, string tenantId);
    Task<PayrollSummaryDto> GetPayrollSummaryAsync(string laborId, string tenantId);
    // List endpoints
    Task<IEnumerable<ProjectCostReportDto>> GetAllProjectCostReportsAsync(string tenantId);
    Task<IEnumerable<ClientBillingReportDto>> GetAllClientBillingReportsAsync(string tenantId);
    Task<IEnumerable<PayrollSummaryDto>> GetAllPayrollSummariesAsync(string tenantId);
}
