using CleanArchitectureApp.Application.DTOs;

namespace CleanArchitectureApp.Application.Interfaces;

public interface ISiteService
{
    Task<IEnumerable<SiteDto>> GetAllSitesAsync(string tenantId);
    Task<SiteDto?> GetSiteByIdAsync(string id, string tenantId);
    Task<IEnumerable<SiteDto>> GetSitesByClientIdAsync(string clientId, string tenantId);
    Task<SiteDto> CreateSiteAsync(CreateSiteDto createSiteDto, string tenantId, string userId);
    Task<SiteDto?> UpdateSiteAsync(string id, UpdateSiteDto updateSiteDto, string tenantId, string userId);
    Task<bool> DeleteSiteAsync(string id, string tenantId);
}
