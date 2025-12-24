namespace CleanArchitectureApp.Domain.Entities;

/// <summary>
/// Represents an invoice issued to a client for a project.
/// </summary>
public class Invoice : TenantEntity
{
    public string Id { get; set; } = string.Empty;
    public string ClientId { get; set; } = string.Empty;
    public Client? Client { get; set; }
    public string ProjectId { get; set; } = string.Empty;
    public Project? Project { get; set; }
    public required string InvoiceNumber { get; set; }
    public DateTime InvoiceDate { get; set; } = DateTime.UtcNow;
    public decimal SubTotal { get; set; }
    public decimal? TaxAmount { get; set; }
    public decimal? RetentionAmount { get; set; }
    public decimal? TDSAmount { get; set; }
    public decimal GrandTotal { get; set; }
    public string Status { get; set; } = "Draft"; // Draft, Sent, Paid, Cancelled
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string CreatedBy { get; set; } = string.Empty;
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedBy { get; set; }
    public ICollection<InvoiceItem> Items { get; set; } = new List<InvoiceItem>();
}
