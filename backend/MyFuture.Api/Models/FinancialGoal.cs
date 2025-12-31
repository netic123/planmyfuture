namespace MyFuture.Api.Models;

public enum GoalType
{
    Savings = 0,           // Sparmål
    DebtPayoff = 1,        // Betala av skuld
    Investment = 2,        // Investeringsmål
    Emergency = 3,         // Buffert
    Retirement = 4,        // Pension
    Purchase = 5,          // Köpmål (bil, resa, etc.)
    Other = 6              // Övrigt
}

public class FinancialGoal
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public GoalType Type { get; set; }
    
    public decimal TargetAmount { get; set; }
    public decimal CurrentAmount { get; set; }
    public decimal? MonthlyContribution { get; set; }  // Månatligt sparande
    
    public DateTime? TargetDate { get; set; }
    public DateTime? StartDate { get; set; }
    
    public string? Color { get; set; }
    public string? Icon { get; set; }
    public int SortOrder { get; set; } = 0;
    public bool IsCompleted { get; set; } = false;
    public DateTime? CompletedAt { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    // Foreign key - kopplat till användare
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    
    // Beräknade värden
    public decimal ProgressPercentage => TargetAmount > 0 
        ? Math.Round((CurrentAmount / TargetAmount) * 100, 2) 
        : 0;
    
    public decimal RemainingAmount => TargetAmount - CurrentAmount;
    
    public int? MonthsToGoal => MonthlyContribution.HasValue && MonthlyContribution.Value > 0
        ? (int)Math.Ceiling(RemainingAmount / MonthlyContribution.Value)
        : null;
}


