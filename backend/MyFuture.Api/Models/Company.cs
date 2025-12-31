namespace MyFuture.Api.Models;

public class Company
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string OrganizationNumber { get; set; } = string.Empty;
    public string? Address { get; set; }
    public string? PostalCode { get; set; }
    public string? City { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? Website { get; set; }
    public string? BankAccount { get; set; }
    public string? Bankgiro { get; set; }
    public string? Plusgiro { get; set; }
    public int? CurrentFiscalYear { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Foreign keys
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    
    // Navigation
    public ICollection<Account> Accounts { get; set; } = new List<Account>();
    public ICollection<Customer> Customers { get; set; } = new List<Customer>();
    public ICollection<Invoice> Invoices { get; set; } = new List<Invoice>();
    public ICollection<Voucher> Vouchers { get; set; } = new List<Voucher>();
    public ICollection<Employee> Employees { get; set; } = new List<Employee>();
}

