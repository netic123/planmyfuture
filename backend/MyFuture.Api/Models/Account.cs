namespace MyFuture.Api.Models;

public class Account
{
    public int Id { get; set; }
    public string AccountNumber { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public AccountType Type { get; set; }
    public bool IsActive { get; set; } = true;
    
    // Foreign keys
    public int CompanyId { get; set; }
    public Company Company { get; set; } = null!;
    
    // Navigation
    public ICollection<VoucherRow> VoucherRows { get; set; } = new List<VoucherRow>();
}

public enum AccountType
{
    Asset = 1,      // Tillgångar (1xxx)
    Liability = 2,  // Skulder (2xxx)
    Revenue = 3,    // Intäkter (3xxx)
    Expense = 4,    // Kostnader (4xxx-8xxx)
    FinancialIncome = 5,  // Finansiella intäkter
    FinancialExpense = 6  // Finansiella kostnader
}

