using Microsoft.EntityFrameworkCore;
using MyFuture.Api.Data;
using MyFuture.Api.DTOs;
using MyFuture.Api.Models;

namespace MyFuture.Api.Services;

public interface IAccountService
{
    Task<List<AccountDto>> GetAccountsAsync(int companyId);
    Task<AccountDto?> GetAccountAsync(int accountId, int companyId);
    Task<AccountDto?> CreateAccountAsync(CreateAccountRequest request, int companyId);
    Task<bool> DeleteAccountAsync(int accountId, int companyId);
    Task<List<AccountBalanceDto>> GetAccountBalancesAsync(int companyId, DateTime? asOfDate = null);
}

public class AccountService : IAccountService
{
    private readonly AppDbContext _context;

    public AccountService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<AccountDto>> GetAccountsAsync(int companyId)
    {
        return await _context.Accounts
            .Where(a => a.CompanyId == companyId && a.IsActive)
            .OrderBy(a => a.AccountNumber)
            .Select(a => new AccountDto(
                a.Id,
                a.AccountNumber,
                a.Name,
                a.Type,
                a.IsActive
            ))
            .ToListAsync();
    }

    public async Task<AccountDto?> GetAccountAsync(int accountId, int companyId)
    {
        var account = await _context.Accounts
            .FirstOrDefaultAsync(a => a.Id == accountId && a.CompanyId == companyId);

        return account != null ? new AccountDto(
            account.Id,
            account.AccountNumber,
            account.Name,
            account.Type,
            account.IsActive
        ) : null;
    }

    public async Task<AccountDto?> CreateAccountAsync(CreateAccountRequest request, int companyId)
    {
        // Check if account number already exists
        var exists = await _context.Accounts
            .AnyAsync(a => a.CompanyId == companyId && a.AccountNumber == request.AccountNumber);

        if (exists) return null;

        var account = new Account
        {
            AccountNumber = request.AccountNumber,
            Name = request.Name,
            Type = request.Type,
            CompanyId = companyId,
            IsActive = true
        };

        _context.Accounts.Add(account);
        await _context.SaveChangesAsync();

        return new AccountDto(
            account.Id,
            account.AccountNumber,
            account.Name,
            account.Type,
            account.IsActive
        );
    }

    public async Task<bool> DeleteAccountAsync(int accountId, int companyId)
    {
        var account = await _context.Accounts
            .FirstOrDefaultAsync(a => a.Id == accountId && a.CompanyId == companyId);

        if (account == null) return false;

        // Check if account is used in any vouchers
        var isUsed = await _context.VoucherRows.AnyAsync(r => r.AccountId == accountId);
        if (isUsed)
        {
            // Just mark as inactive instead of deleting
            account.IsActive = false;
            await _context.SaveChangesAsync();
            return true;
        }

        _context.Accounts.Remove(account);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<List<AccountBalanceDto>> GetAccountBalancesAsync(int companyId, DateTime? asOfDate = null)
    {
        var date = asOfDate ?? DateTime.UtcNow;

        var balances = await _context.Accounts
            .Where(a => a.CompanyId == companyId && a.IsActive)
            .Select(a => new
            {
                a.Id,
                a.AccountNumber,
                a.Name,
                a.Type,
                Debit = a.VoucherRows
                    .Where(r => r.Voucher.VoucherDate <= date)
                    .Sum(r => r.Debit),
                Credit = a.VoucherRows
                    .Where(r => r.Voucher.VoucherDate <= date)
                    .Sum(r => r.Credit)
            })
            .OrderBy(a => a.AccountNumber)
            .ToListAsync();

        return balances.Select(a => new AccountBalanceDto(
            a.Id,
            a.AccountNumber,
            a.Name,
            a.Type,
            a.Debit,
            a.Credit,
            a.Debit - a.Credit
        )).ToList();
    }
}

