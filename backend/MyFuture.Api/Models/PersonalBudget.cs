namespace MyFuture.Api.Models;

public enum BudgetItemType
{
    Income = 0,      // Inkomst (lön, etc.)
    Expense = 1      // Utgift (hyra, ränta, etc.)
}

public enum BudgetCategory
{
    Salary = 0,           // Lön
    Interest = 1,         // Ränta
    Rent = 2,             // Hyra
    Amortization = 3,     // Amortering
    Food = 4,             // Mat
    Transportation = 5,   // Transport
    Insurance = 6,        // Försäkring
    Utilities = 7,        // El, vatten, etc.
    Entertainment = 8,    // Nöje
    Savings = 9,          // Sparande
    Other = 10            // Övrigt
}

public class PersonalBudget
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;  // Ex: "Ränta", "Hyra", "Lön"
    public decimal Amount { get; set; }
    public BudgetItemType Type { get; set; }
    public BudgetCategory Category { get; set; }
    public bool IsRecurring { get; set; } = true;  // Återkommande månadsvis
    public string? Notes { get; set; }
    public int SortOrder { get; set; } = 0;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    // Foreign key - kopplat till användare (personlig ekonomi)
    public int UserId { get; set; }
    public User User { get; set; } = null!;
}


