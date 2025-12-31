namespace MyFuture.Api.Models;

public enum ExpenseStatus
{
    Draft = 0,
    Submitted = 1,
    Approved = 2,
    Paid = 3,
    Rejected = 4
}

public enum ExpenseCategory
{
    Travel = 0,          // Resa
    Accommodation = 1,   // Logi
    Meals = 2,           // Måltider
    Entertainment = 3,   // Representation
    Materials = 4,       // Material
    Software = 5,        // Programvara
    Equipment = 6,       // Utrustning
    Phone = 7,           // Telefon
    Other = 8            // Övrigt
}

public class Expense
{
    public int Id { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public decimal VatAmount { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal VatRate { get; set; } = 25;
    public DateTime ExpenseDate { get; set; }
    public ExpenseCategory Category { get; set; }
    public ExpenseStatus Status { get; set; } = ExpenseStatus.Draft;
    public string? ReceiptNumber { get; set; }
    public string? Notes { get; set; }
    public string? Supplier { get; set; }  // Leverantör/butik
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ApprovedAt { get; set; }
    public DateTime? PaidAt { get; set; }
    
    // Foreign keys
    public int CompanyId { get; set; }
    public Company Company { get; set; } = null!;
    
    public int? EmployeeId { get; set; }  // Om utlägget är kopplat till en anställd
    public Employee? Employee { get; set; }
    
    public int? AccountId { get; set; }  // Bokföringskonto
    public Account? Account { get; set; }
}



