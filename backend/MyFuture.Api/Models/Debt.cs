namespace MyFuture.Api.Models;

public enum DebtType
{
    Mortgage = 0,          // Bolån
    StudentLoan = 1,       // Studielån
    CarLoan = 2,           // Billån
    PersonalLoan = 3,      // Privatlån
    CreditCard = 4,        // Kreditkort
    TaxDebt = 5,           // Skatteskuld
    BusinessLoan = 6,      // Företagslån
    Other = 7              // Övrigt
}

public class Debt
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;  // Ex: "Bostadslån", "Skatteverket"
    public string? Lender { get; set; }  // Ex: "SBAB", "Skatteverket"
    public DebtType Type { get; set; }
    
    // Belopp
    public decimal OriginalAmount { get; set; }  // Ursprungligt lånebelopp
    public decimal CurrentBalance { get; set; }  // Nuvarande skuld
    public decimal? AssetValue { get; set; }     // Värdet på tillgången (t.ex. bostadens värde)
    
    // Ränta och amortering
    public decimal InterestRate { get; set; }    // Räntesats i %
    public decimal? AmortizationRate { get; set; }  // Amorteringstakt i % (för auto-beräkning)
    public decimal? MonthlyPayment { get; set; } // Avgift/månad (ej ränta/amortering)
    public decimal? MonthlyAmortization { get; set; }  // Amortering per månad (auto-beräknad eller manuell)
    
    // Beräknade månadskostnader
    public decimal MonthlyInterest => CurrentBalance * (InterestRate / 100) / 12;
    public decimal CalculatedMonthlyAmortization => AmortizationRate.HasValue 
        ? CurrentBalance * (AmortizationRate.Value / 100) / 12 
        : MonthlyAmortization ?? 0;
    
    // Datum
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }       // Slutdatum för lån
    public DateTime? NextPaymentDate { get; set; }
    
    public string? Color { get; set; }
    public int SortOrder { get; set; } = 0;
    public bool IsActive { get; set; } = true;
    public string? Notes { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    // Foreign key - kopplat till användare
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    
    // Beräknade värden
    public decimal RemainingPercentage => OriginalAmount > 0 
        ? Math.Round((CurrentBalance / OriginalAmount) * 100, 2) 
        : 0;
    
    public decimal EquityInAsset => AssetValue.HasValue 
        ? AssetValue.Value - CurrentBalance 
        : 0;
}


