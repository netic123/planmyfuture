namespace MyFuture.Api.Models;

public class Voucher
{
    public int Id { get; set; }
    public string VoucherNumber { get; set; } = string.Empty;
    public DateTime VoucherDate { get; set; }
    public string Description { get; set; } = string.Empty;
    public VoucherType Type { get; set; } = VoucherType.Manual;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Foreign keys
    public int CompanyId { get; set; }
    public Company Company { get; set; } = null!;
    
    // Navigation
    public ICollection<VoucherRow> Rows { get; set; } = new List<VoucherRow>();
}

public enum VoucherType
{
    Manual = 0,
    Invoice = 1,
    Payment = 2,
    Salary = 3,
    Other = 4
}

public class VoucherRow
{
    public int Id { get; set; }
    public decimal Debit { get; set; }
    public decimal Credit { get; set; }
    public string? Description { get; set; }
    public int SortOrder { get; set; }
    
    // Foreign keys
    public int VoucherId { get; set; }
    public Voucher Voucher { get; set; } = null!;
    public int AccountId { get; set; }
    public Account Account { get; set; } = null!;
}

