namespace MyFuture.Api.Models;

public enum VatPeriodType
{
    Monthly = 0,      // Månadsvis
    Quarterly = 1,    // Kvartalsvis (Q1, Q2, Q3, Q4)
    Yearly = 2        // Årsvis
}

public class VatPayment
{
    public int Id { get; set; }
    public int Year { get; set; }
    public int Period { get; set; } // 1-12 för månader, 1-4 för kvartal, 1 för år
    public VatPeriodType PeriodType { get; set; }
    
    public decimal OutputVat { get; set; }      // Utgående moms
    public decimal InputVat { get; set; }       // Ingående moms
    public decimal VatToPay { get; set; }       // Moms att betala (kan vara negativ = fordran)
    
    public bool IsPaid { get; set; }
    public DateTime? PaidAt { get; set; }
    public decimal? PaidAmount { get; set; }
    public string? PaymentReference { get; set; }
    public string? Notes { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    
    // Foreign keys
    public int CompanyId { get; set; }
    public Company Company { get; set; } = null!;
}



