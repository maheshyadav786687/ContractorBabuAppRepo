namespace CleanArchitectureApp.Application.DTOs;

public class SiteDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string? City { get; set; }
    public string? State { get; set; }
    public string? ZipCode { get; set; }
    public string ClientId { get; set; } = string.Empty;
    public string ClientName { get; set; } = string.Empty; // For display
    public DateTime CreatedAt { get; set; }
    public bool IsActive { get; set; }
}

public class CreateSiteDto
{
    public required string Name { get; set; }
    public required string Address { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? ZipCode { get; set; }
    public required string ClientId { get; set; }
}

public class UpdateSiteDto
{
    public string? Name { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? ZipCode { get; set; }
    public bool? IsActive { get; set; }
}
