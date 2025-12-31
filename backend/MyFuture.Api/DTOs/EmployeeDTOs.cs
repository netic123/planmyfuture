namespace MyFuture.Api.DTOs;

public record CreateEmployeeRequest(
    string FirstName,
    string LastName,
    string? PersonalNumber,
    string? Address,
    string? PostalCode,
    string? City,
    string? Email,
    string? Phone,
    string? BankAccount,
    decimal MonthlySalary,
    decimal TaxRate,
    DateTime StartDate
);

public record UpdateEmployeeRequest(
    string FirstName,
    string LastName,
    string? PersonalNumber,
    string? Address,
    string? PostalCode,
    string? City,
    string? Email,
    string? Phone,
    string? BankAccount,
    decimal MonthlySalary,
    decimal TaxRate,
    bool IsActive
);

public record EmployeeDto(
    int Id,
    string EmployeeNumber,
    string FirstName,
    string LastName,
    string FullName,
    string? PersonalNumber,
    string? Address,
    string? PostalCode,
    string? City,
    string? Email,
    string? Phone,
    string? BankAccount,
    decimal MonthlySalary,
    decimal TaxRate,
    DateTime StartDate,
    DateTime? EndDate,
    bool IsActive
);

public record CreateSalaryRequest(
    int EmployeeId,
    int Year,
    int Month,
    DateTime PaymentDate
);

public record SalaryDto(
    int Id,
    int EmployeeId,
    string EmployeeName,
    DateTime PaymentDate,
    int Year,
    int Month,
    decimal GrossSalary,
    decimal TaxAmount,
    decimal NetSalary,
    decimal EmployerContribution,
    bool IsPaid
);

