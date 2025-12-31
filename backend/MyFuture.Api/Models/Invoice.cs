namespace MyFuture.Api.Models;

public class Invoice
{
    public int Id { get; set; }
    public string InvoiceNumber { get; set; } = string.Empty;
    public DateTime InvoiceDate { get; set; }
    public DateTime DueDate { get; set; }
    public InvoiceStatus Status { get; set; } = InvoiceStatus.Draft;
    public decimal TotalExcludingVat { get; set; }
    public decimal VatAmount { get; set; }
    public decimal TotalIncludingVat { get; set; }
    public string? Reference { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? PaidAt { get; set; }
    
    // Foreign keys
    public int CompanyId { get; set; }
    public Company Company { get; set; } = null!;
    public int CustomerId { get; set; }
    public Customer Customer { get; set; } = null!;
    
    // Navigation
    public ICollection<InvoiceLine> Lines { get; set; } = new List<InvoiceLine>();
}

public enum InvoiceStatus
{
    Draft = 0,
    Sent = 1,
    Paid = 2,
    Overdue = 3,
    Cancelled = 4
}

public class InvoiceLine
{
    public int Id { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public string Unit { get; set; } = "st";
    public decimal UnitPrice { get; set; }
    public decimal VatRate { get; set; } = 25;
    public decimal TotalExcludingVat { get; set; }
    public decimal VatAmount { get; set; }
    public decimal TotalIncludingVat { get; set; }
    public int SortOrder { get; set; }
    
    // Foreign keys
    public int InvoiceId { get; set; }
    public Invoice Invoice { get; set; } = null!;
}

