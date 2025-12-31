namespace MyFuture.Api.Models;

public class Customer
{
    public int Id { get; set; }
    public string CustomerNumber { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? OrganizationNumber { get; set; }
    public string? Address { get; set; }
    public string? PostalCode { get; set; }
    public string? City { get; set; }
    public string? Country { get; set; } = "Sverige";
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public int PaymentTermsDays { get; set; } = 30;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Foreign keys
    public int CompanyId { get; set; }
    public Company Company { get; set; } = null!;
    
    // Navigation
    public ICollection<Invoice> Invoices { get; set; } = new List<Invoice>();
}

