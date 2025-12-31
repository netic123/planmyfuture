using Microsoft.EntityFrameworkCore;
using MyFuture.Api.Data;
using MyFuture.Api.DTOs;
using MyFuture.Api.Models;

namespace MyFuture.Api.Services;

public interface IEmployeeService
{
    Task<List<EmployeeDto>> GetEmployeesAsync(int companyId);
    Task<EmployeeDto?> GetEmployeeAsync(int employeeId, int companyId);
    Task<EmployeeDto?> CreateEmployeeAsync(CreateEmployeeRequest request, int companyId);
    Task<EmployeeDto?> UpdateEmployeeAsync(int employeeId, UpdateEmployeeRequest request, int companyId);
    Task<bool> DeleteEmployeeAsync(int employeeId, int companyId);
    Task<List<SalaryDto>> GetSalariesAsync(int companyId, int? year = null, int? month = null);
    Task<SalaryDto?> CreateSalaryAsync(CreateSalaryRequest request, int companyId);
    Task<bool> MarkSalaryAsPaidAsync(int salaryId, int companyId);
}

public class EmployeeService : IEmployeeService
{
    private readonly AppDbContext _context;
    private const decimal EmployerContributionRate = 0.3142m; // 31.42%

    public EmployeeService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<EmployeeDto>> GetEmployeesAsync(int companyId)
    {
        return await _context.Employees
            .Where(e => e.CompanyId == companyId)
            .OrderBy(e => e.EmployeeNumber)
            .Select(e => ToDto(e))
            .ToListAsync();
    }

    public async Task<EmployeeDto?> GetEmployeeAsync(int employeeId, int companyId)
    {
        var employee = await _context.Employees
            .FirstOrDefaultAsync(e => e.Id == employeeId && e.CompanyId == companyId);

        return employee != null ? ToDto(employee) : null;
    }

    public async Task<EmployeeDto?> CreateEmployeeAsync(CreateEmployeeRequest request, int companyId)
    {
        var nextNumber = await _context.Employees
            .Where(e => e.CompanyId == companyId)
            .MaxAsync(e => (int?)int.Parse(e.EmployeeNumber)) ?? 0;

        var employee = new Employee
        {
            EmployeeNumber = (nextNumber + 1).ToString().PadLeft(3, '0'),
            FirstName = request.FirstName,
            LastName = request.LastName,
            PersonalNumber = request.PersonalNumber,
            Address = request.Address,
            PostalCode = request.PostalCode,
            City = request.City,
            Email = request.Email,
            Phone = request.Phone,
            BankAccount = request.BankAccount,
            MonthlySalary = request.MonthlySalary,
            TaxRate = request.TaxRate,
            StartDate = request.StartDate,
            CompanyId = companyId,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.Employees.Add(employee);
        await _context.SaveChangesAsync();

        return ToDto(employee);
    }

    public async Task<EmployeeDto?> UpdateEmployeeAsync(int employeeId, UpdateEmployeeRequest request, int companyId)
    {
        var employee = await _context.Employees
            .FirstOrDefaultAsync(e => e.Id == employeeId && e.CompanyId == companyId);

        if (employee == null) return null;

        employee.FirstName = request.FirstName;
        employee.LastName = request.LastName;
        employee.PersonalNumber = request.PersonalNumber;
        employee.Address = request.Address;
        employee.PostalCode = request.PostalCode;
        employee.City = request.City;
        employee.Email = request.Email;
        employee.Phone = request.Phone;
        employee.BankAccount = request.BankAccount;
        employee.MonthlySalary = request.MonthlySalary;
        employee.TaxRate = request.TaxRate;
        employee.IsActive = request.IsActive;

        if (!request.IsActive && employee.EndDate == null)
        {
            employee.EndDate = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();
        return ToDto(employee);
    }

    public async Task<bool> DeleteEmployeeAsync(int employeeId, int companyId)
    {
        var employee = await _context.Employees
            .FirstOrDefaultAsync(e => e.Id == employeeId && e.CompanyId == companyId);

        if (employee == null) return false;

        // Check if there are any salaries
        var hasSalaries = await _context.Salaries.AnyAsync(s => s.EmployeeId == employeeId);
        if (hasSalaries)
        {
            employee.IsActive = false;
            employee.EndDate = DateTime.UtcNow;
        }
        else
        {
            _context.Employees.Remove(employee);
        }

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<List<SalaryDto>> GetSalariesAsync(int companyId, int? year = null, int? month = null)
    {
        var query = _context.Salaries
            .Include(s => s.Employee)
            .Where(s => s.Employee.CompanyId == companyId);

        if (year.HasValue)
            query = query.Where(s => s.Year == year.Value);

        if (month.HasValue)
            query = query.Where(s => s.Month == month.Value);

        return await query
            .OrderByDescending(s => s.Year)
            .ThenByDescending(s => s.Month)
            .ThenBy(s => s.Employee.EmployeeNumber)
            .Select(s => new SalaryDto(
                s.Id,
                s.EmployeeId,
                s.Employee.FullName,
                s.PaymentDate,
                s.Year,
                s.Month,
                s.GrossSalary,
                s.TaxAmount,
                s.NetSalary,
                s.EmployerContribution,
                s.IsPaid
            ))
            .ToListAsync();
    }

    public async Task<SalaryDto?> CreateSalaryAsync(CreateSalaryRequest request, int companyId)
    {
        var employee = await _context.Employees
            .FirstOrDefaultAsync(e => e.Id == request.EmployeeId && e.CompanyId == companyId);

        if (employee == null || !employee.IsActive) return null;

        // Check if salary already exists for this month
        var exists = await _context.Salaries
            .AnyAsync(s => s.EmployeeId == request.EmployeeId && s.Year == request.Year && s.Month == request.Month);

        if (exists) return null;

        var grossSalary = employee.MonthlySalary;
        var taxAmount = grossSalary * (employee.TaxRate / 100);
        var netSalary = grossSalary - taxAmount;
        var employerContribution = grossSalary * EmployerContributionRate;

        var salary = new Salary
        {
            EmployeeId = request.EmployeeId,
            PaymentDate = request.PaymentDate,
            Year = request.Year,
            Month = request.Month,
            GrossSalary = grossSalary,
            TaxAmount = taxAmount,
            NetSalary = netSalary,
            EmployerContribution = employerContribution,
            IsPaid = false,
            CreatedAt = DateTime.UtcNow
        };

        _context.Salaries.Add(salary);
        await _context.SaveChangesAsync();

        return new SalaryDto(
            salary.Id,
            salary.EmployeeId,
            employee.FullName,
            salary.PaymentDate,
            salary.Year,
            salary.Month,
            salary.GrossSalary,
            salary.TaxAmount,
            salary.NetSalary,
            salary.EmployerContribution,
            salary.IsPaid
        );
    }

    public async Task<bool> MarkSalaryAsPaidAsync(int salaryId, int companyId)
    {
        var salary = await _context.Salaries
            .Include(s => s.Employee)
            .FirstOrDefaultAsync(s => s.Id == salaryId && s.Employee.CompanyId == companyId);

        if (salary == null) return false;

        salary.IsPaid = true;
        await _context.SaveChangesAsync();
        return true;
    }

    private static EmployeeDto ToDto(Employee employee) => new(
        employee.Id,
        employee.EmployeeNumber,
        employee.FirstName,
        employee.LastName,
        employee.FullName,
        employee.PersonalNumber,
        employee.Address,
        employee.PostalCode,
        employee.City,
        employee.Email,
        employee.Phone,
        employee.BankAccount,
        employee.MonthlySalary,
        employee.TaxRate,
        employee.StartDate,
        employee.EndDate,
        employee.IsActive
    );
}

