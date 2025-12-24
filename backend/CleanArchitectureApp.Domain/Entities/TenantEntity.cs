namespace CleanArchitectureApp.Domain.Entities;

/// <summary>
/// Base entity that all tenant-specific entities inherit from.
/// Ensures all data is isolated per tenant.
/// </summary>
public abstract class TenantEntity
{
    public string TenantId { get; set; } = string.Empty;
    public Tenant? Tenant { get; set; }
}
