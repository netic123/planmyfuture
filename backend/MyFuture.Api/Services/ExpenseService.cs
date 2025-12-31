using Microsoft.EntityFrameworkCore;
using MyFuture.Api.Data;
using MyFuture.Api.DTOs;
using MyFuture.Api.Models;

namespace MyFuture.Api.Services;

public interface IExpenseService
{
    Task<List<ExpenseListDto>> GetExpensesAsync(int companyId);
    Task<ExpenseDto?> GetExpenseAsync(int expenseId, int companyId);
    Task<ExpenseDto?> CreateExpenseAsync(CreateExpenseRequest request, int companyId);
    Task<ExpenseDto?> UpdateExpenseAsync(int expenseId, UpdateExpenseRequest request, int companyId);
    Task<bool> DeleteExpenseAsync(int expenseId, int companyId);
    Task<bool> SubmitExpenseAsync(int expenseId, int companyId);
    Task<bool> ApproveExpenseAsync(int expenseId, int companyId);
    Task<bool> RejectExpenseAsync(int expenseId, int companyId);
    Task<bool> MarkAsPaidAsync(int expenseId, int companyId);
}

public class ExpenseService : IExpenseService
{
    private readonly AppDbContext _context;

    public ExpenseService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<ExpenseListDto>> GetExpensesAsync(int companyId)
    {
        return await _context.Expenses
            .Where(e => e.CompanyId == companyId)
            .Include(e => e.Employee)
            .OrderByDescending(e => e.ExpenseDate)
            .Select(e => new ExpenseListDto(
                e.Id,
                e.Description,
                e.TotalAmount,
                e.ExpenseDate,
                e.Category,
                e.Status,
                e.Supplier,
                e.Employee != null ? $"{e.Employee.FirstName} {e.Employee.LastName}" : null
            ))
            .ToListAsync();
    }

    public async Task<ExpenseDto?> GetExpenseAsync(int expenseId, int companyId)
    {
        var expense = await _context.Expenses
            .Include(e => e.Employee)
            .Include(e => e.Account)
            .FirstOrDefaultAsync(e => e.Id == expenseId && e.CompanyId == companyId);

        return expense != null ? ToDto(expense) : null;
    }

    public async Task<ExpenseDto?> CreateExpenseAsync(CreateExpenseRequest request, int companyId)
    {
        var vatAmount = request.Amount * (request.VatRate / 100);
        
        var expense = new Expense
        {
            Description = request.Description,
            Amount = request.Amount,
            VatRate = request.VatRate,
            VatAmount = vatAmount,
            TotalAmount = request.Amount + vatAmount,
            ExpenseDate = request.ExpenseDate,
            Category = request.Category,
            ReceiptNumber = request.ReceiptNumber,
            Notes = request.Notes,
            Supplier = request.Supplier,
            EmployeeId = request.EmployeeId,
            AccountId = request.AccountId,
            CompanyId = companyId,
            Status = ExpenseStatus.Draft,
            CreatedAt = DateTime.UtcNow
        };

        _context.Expenses.Add(expense);
        await _context.SaveChangesAsync();

        return await GetExpenseAsync(expense.Id, companyId);
    }

    public async Task<ExpenseDto?> UpdateExpenseAsync(int expenseId, UpdateExpenseRequest request, int companyId)
    {
        var expense = await _context.Expenses
            .FirstOrDefaultAsync(e => e.Id == expenseId && e.CompanyId == companyId);

        if (expense == null || expense.Status != ExpenseStatus.Draft) return null;

        var vatAmount = request.Amount * (request.VatRate / 100);

        expense.Description = request.Description;
        expense.Amount = request.Amount;
        expense.VatRate = request.VatRate;
        expense.VatAmount = vatAmount;
        expense.TotalAmount = request.Amount + vatAmount;
        expense.ExpenseDate = request.ExpenseDate;
        expense.Category = request.Category;
        expense.ReceiptNumber = request.ReceiptNumber;
        expense.Notes = request.Notes;
        expense.Supplier = request.Supplier;
        expense.EmployeeId = request.EmployeeId;
        expense.AccountId = request.AccountId;

        await _context.SaveChangesAsync();
        return await GetExpenseAsync(expense.Id, companyId);
    }

    public async Task<bool> DeleteExpenseAsync(int expenseId, int companyId)
    {
        var expense = await _context.Expenses
            .FirstOrDefaultAsync(e => e.Id == expenseId && e.CompanyId == companyId);

        if (expense == null || expense.Status != ExpenseStatus.Draft) return false;

        _context.Expenses.Remove(expense);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> SubmitExpenseAsync(int expenseId, int companyId)
    {
        var expense = await _context.Expenses
            .FirstOrDefaultAsync(e => e.Id == expenseId && e.CompanyId == companyId);

        if (expense == null || expense.Status != ExpenseStatus.Draft) return false;

        expense.Status = ExpenseStatus.Submitted;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ApproveExpenseAsync(int expenseId, int companyId)
    {
        var expense = await _context.Expenses
            .FirstOrDefaultAsync(e => e.Id == expenseId && e.CompanyId == companyId);

        if (expense == null || expense.Status != ExpenseStatus.Submitted) return false;

        expense.Status = ExpenseStatus.Approved;
        expense.ApprovedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> RejectExpenseAsync(int expenseId, int companyId)
    {
        var expense = await _context.Expenses
            .FirstOrDefaultAsync(e => e.Id == expenseId && e.CompanyId == companyId);

        if (expense == null || expense.Status != ExpenseStatus.Submitted) return false;

        expense.Status = ExpenseStatus.Rejected;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> MarkAsPaidAsync(int expenseId, int companyId)
    {
        var expense = await _context.Expenses
            .FirstOrDefaultAsync(e => e.Id == expenseId && e.CompanyId == companyId);

        if (expense == null || expense.Status != ExpenseStatus.Approved) return false;

        expense.Status = ExpenseStatus.Paid;
        expense.PaidAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return true;
    }

    private static ExpenseDto ToDto(Expense expense) => new(
        expense.Id,
        expense.Description,
        expense.Amount,
        expense.VatAmount,
        expense.TotalAmount,
        expense.VatRate,
        expense.ExpenseDate,
        expense.Category,
        expense.Status,
        expense.ReceiptNumber,
        expense.Notes,
        expense.Supplier,
        expense.CreatedAt,
        expense.ApprovedAt,
        expense.PaidAt,
        expense.EmployeeId,
        expense.Employee != null ? $"{expense.Employee.FirstName} {expense.Employee.LastName}" : null,
        expense.AccountId,
        expense.Account?.Name
    );
}



