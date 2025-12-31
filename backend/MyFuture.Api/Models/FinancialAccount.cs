namespace MyFuture.Api.Models;

public enum AccountCategory
{
    Cash = 0,              // Kontanter hemma
    BankAccount = 1,       // Bankkonto
    Savings = 2,           // Sparkonto
    Investment = 3,        // Investeringar/Aktier/Fonder
    Pension = 4,           // Pension
    RealEstate = 5,        // Fastighet/Bostad
    Business = 6,          // Företagskonto
    Crypto = 7,            // Kryptovaluta
    Other = 8              // Övrigt
}

public class FinancialAccount
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;  // Ex: "MoneyInZefyrPrivat", "Aktier"
    public string? Institution { get; set; }  // Ex: "Avanza", "Nordea", "Zefyr"
    public decimal Balance { get; set; }
    public AccountCategory Category { get; set; }
    public string? AccountNumber { get; set; }  // Valfritt kontonummer/referens
    public string? Color { get; set; }  // Färg för visualisering
    public string? Icon { get; set; }   // Ikon-namn
    public int SortOrder { get; set; } = 0;
    public bool IsActive { get; set; } = true;
    public string? Notes { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    // Håll koll på balanshistorik
    public DateTime? LastBalanceUpdate { get; set; }
    
    // Foreign key - kopplat till användare
    public int UserId { get; set; }
    public User User { get; set; } = null!;
}


