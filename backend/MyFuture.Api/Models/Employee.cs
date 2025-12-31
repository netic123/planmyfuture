namespace MyFuture.Api.Models;

public class Employee
{
    public int Id { get; set; }
    public string EmployeeNumber { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? PersonalNumber { get; set; }
    public string? Address { get; set; }
    public string? PostalCode { get; set; }
    public string? City { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? BankAccount { get; set; }
    public decimal MonthlySalary { get; set; }
    public decimal TaxRate { get; set; } = 30;
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Foreign keys
    public int CompanyId { get; set; }
    public Company Company { get; set; } = null!;
    
    // Navigation
    public ICollection<Salary> Salaries { get; set; } = new List<Salary>();
    
    public string FullName => $"{FirstName} {LastName}";
}

public class Salary
{
    public int Id { get; set; }
    public DateTime PaymentDate { get; set; }
    public int Year { get; set; }
    public int Month { get; set; }
    public decimal GrossSalary { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal NetSalary { get; set; }
    public decimal EmployerContribution { get; set; } // Arbetsgivaravgifter (31.42%)
    public bool IsPaid { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Foreign keys
    public int EmployeeId { get; set; }
    public Employee Employee { get; set; } = null!;
}

