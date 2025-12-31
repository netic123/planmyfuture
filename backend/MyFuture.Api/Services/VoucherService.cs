using Microsoft.EntityFrameworkCore;
using MyFuture.Api.Data;
using MyFuture.Api.DTOs;
using MyFuture.Api.Models;

namespace MyFuture.Api.Services;

public interface IVoucherService
{
    Task<List<VoucherListDto>> GetVouchersAsync(int companyId);
    Task<VoucherDto?> GetVoucherAsync(int voucherId, int companyId);
    Task<VoucherDto?> CreateVoucherAsync(CreateVoucherRequest request, int companyId);
    Task<bool> DeleteVoucherAsync(int voucherId, int companyId);
}

public class VoucherService : IVoucherService
{
    private readonly AppDbContext _context;

    public VoucherService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<VoucherListDto>> GetVouchersAsync(int companyId)
    {
        return await _context.Vouchers
            .Where(v => v.CompanyId == companyId)
            .Include(v => v.Rows)
            .OrderByDescending(v => v.VoucherDate)
            .ThenByDescending(v => v.VoucherNumber)
            .Select(v => new VoucherListDto(
                v.Id,
                v.VoucherNumber,
                v.VoucherDate,
                v.Description,
                v.Type,
                v.Rows.Sum(r => r.Debit)
            ))
            .ToListAsync();
    }

    public async Task<VoucherDto?> GetVoucherAsync(int voucherId, int companyId)
    {
        var voucher = await _context.Vouchers
            .Include(v => v.Rows)
            .ThenInclude(r => r.Account)
            .FirstOrDefaultAsync(v => v.Id == voucherId && v.CompanyId == companyId);

        return voucher != null ? ToDto(voucher) : null;
    }

    public async Task<VoucherDto?> CreateVoucherAsync(CreateVoucherRequest request, int companyId)
    {
        // Validate that debit equals credit
        var totalDebit = request.Rows.Sum(r => r.Debit);
        var totalCredit = request.Rows.Sum(r => r.Credit);
        
        if (totalDebit != totalCredit)
        {
            return null; // Debit must equal credit
        }

        // Validate that all accounts belong to this company
        var accountIds = request.Rows.Select(r => r.AccountId).Distinct();
        var validAccountCount = await _context.Accounts
            .Where(a => a.CompanyId == companyId && accountIds.Contains(a.Id))
            .CountAsync();

        if (validAccountCount != accountIds.Count())
        {
            return null; // Invalid account
        }

        var nextNumber = await _context.Vouchers
            .Where(v => v.CompanyId == companyId)
            .MaxAsync(v => (int?)int.Parse(v.VoucherNumber)) ?? 0;

        var voucher = new Voucher
        {
            VoucherNumber = (nextNumber + 1).ToString().PadLeft(4, '0'),
            VoucherDate = request.VoucherDate,
            Description = request.Description,
            Type = request.Type,
            CompanyId = companyId,
            CreatedAt = DateTime.UtcNow
        };

        var sortOrder = 0;
        foreach (var rowRequest in request.Rows)
        {
            voucher.Rows.Add(new VoucherRow
            {
                AccountId = rowRequest.AccountId,
                Debit = rowRequest.Debit,
                Credit = rowRequest.Credit,
                Description = rowRequest.Description,
                SortOrder = sortOrder++
            });
        }

        _context.Vouchers.Add(voucher);
        await _context.SaveChangesAsync();

        return await GetVoucherAsync(voucher.Id, companyId);
    }

    public async Task<bool> DeleteVoucherAsync(int voucherId, int companyId)
    {
        var voucher = await _context.Vouchers
            .FirstOrDefaultAsync(v => v.Id == voucherId && v.CompanyId == companyId);

        if (voucher == null) return false;

        _context.Vouchers.Remove(voucher);
        await _context.SaveChangesAsync();
        return true;
    }

    private static VoucherDto ToDto(Voucher voucher) => new(
        voucher.Id,
        voucher.VoucherNumber,
        voucher.VoucherDate,
        voucher.Description,
        voucher.Type,
        voucher.CreatedAt,
        voucher.Rows.OrderBy(r => r.SortOrder).Select(r => new VoucherRowDto(
            r.Id,
            r.Account.AccountNumber,
            r.Account.Name,
            r.Debit,
            r.Credit,
            r.Description
        )).ToList()
    );
}

