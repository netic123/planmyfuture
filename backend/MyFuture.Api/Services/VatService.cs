using Microsoft.EntityFrameworkCore;
using MyFuture.Api.Data;
using MyFuture.Api.DTOs;
using MyFuture.Api.Models;

namespace MyFuture.Api.Services;

public interface IVatService
{
    Task<VatSummaryDto> GetVatSummaryAsync(int companyId, int year, VatPeriodType periodType);
    Task<VatPeriodDto?> MarkAsPaidAsync(int companyId, MarkVatPaidRequest request);
    Task<bool> UnmarkAsPaidAsync(int companyId, int year, int period, VatPeriodType periodType);
}

public class VatService : IVatService
{
    private readonly AppDbContext _context;

    public VatService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<VatSummaryDto> GetVatSummaryAsync(int companyId, int year, VatPeriodType periodType)
    {
        var periods = new List<VatPeriodDto>();
        
        // Hämta alla fakturor och utlägg för året
        var invoices = await _context.Invoices
            .Where(i => i.CompanyId == companyId && i.InvoiceDate.Year == year)
            .ToListAsync();
            
        var expenses = await _context.Expenses
            .Where(e => e.CompanyId == companyId && e.ExpenseDate.Year == year && e.Status == ExpenseStatus.Paid)
            .ToListAsync();
            
        // Hämta befintliga momsbetalningar
        var existingPayments = await _context.VatPayments
            .Where(v => v.CompanyId == companyId && v.Year == year && v.PeriodType == periodType)
            .ToListAsync();

        var periodCount = periodType switch
        {
            VatPeriodType.Monthly => 12,
            VatPeriodType.Quarterly => 4,
            VatPeriodType.Yearly => 1,
            _ => 12
        };

        for (int i = 1; i <= periodCount; i++)
        {
            var (fromDate, toDate) = GetPeriodDates(year, i, periodType);
            var periodName = GetPeriodName(i, periodType);
            
            // Beräkna utgående moms (från fakturor)
            var periodInvoices = invoices
                .Where(inv => inv.InvoiceDate >= fromDate && inv.InvoiceDate <= toDate)
                .ToList();
            var outputVat = periodInvoices.Sum(inv => inv.VatAmount);
            
            // Beräkna ingående moms (från utlägg)
            var periodExpenses = expenses
                .Where(exp => exp.ExpenseDate >= fromDate && exp.ExpenseDate <= toDate)
                .ToList();
            var inputVat = periodExpenses.Sum(exp => exp.VatAmount);
            
            var vatToPay = outputVat - inputVat;
            
            // Kolla om perioden är betald
            var existingPayment = existingPayments
                .FirstOrDefault(p => p.Period == i);

            periods.Add(new VatPeriodDto(
                Year: year,
                Period: i,
                PeriodType: periodType,
                PeriodName: periodName,
                FromDate: fromDate,
                ToDate: toDate,
                OutputVat: outputVat,
                InputVat: inputVat,
                VatToPay: vatToPay,
                IsPaid: existingPayment?.IsPaid ?? false,
                PaidAt: existingPayment?.PaidAt,
                PaidAmount: existingPayment?.PaidAmount,
                PaymentReference: existingPayment?.PaymentReference,
                Notes: existingPayment?.Notes
            ));
        }

        var totalOutputVat = periods.Sum(p => p.OutputVat);
        var totalInputVat = periods.Sum(p => p.InputVat);
        var totalVatToPay = periods.Sum(p => p.VatToPay);
        var totalPaid = periods.Where(p => p.IsPaid).Sum(p => p.PaidAmount ?? p.VatToPay);
        var remaining = totalVatToPay - totalPaid;

        return new VatSummaryDto(
            Year: year,
            PeriodType: periodType,
            Periods: periods,
            TotalOutputVat: totalOutputVat,
            TotalInputVat: totalInputVat,
            TotalVatToPay: totalVatToPay,
            TotalPaid: totalPaid,
            Remaining: remaining
        );
    }

    public async Task<VatPeriodDto?> MarkAsPaidAsync(int companyId, MarkVatPaidRequest request)
    {
        // Hämta eller skapa VatPayment
        var existingPayment = await _context.VatPayments
            .FirstOrDefaultAsync(v => 
                v.CompanyId == companyId && 
                v.Year == request.Year && 
                v.Period == request.Period && 
                v.PeriodType == request.PeriodType);

        var (fromDate, toDate) = GetPeriodDates(request.Year, request.Period, request.PeriodType);
        
        // Beräkna moms för perioden
        var invoices = await _context.Invoices
            .Where(i => i.CompanyId == companyId && i.InvoiceDate >= fromDate && i.InvoiceDate <= toDate)
            .ToListAsync();
        var outputVat = invoices.Sum(i => i.VatAmount);
        
        var expenses = await _context.Expenses
            .Where(e => e.CompanyId == companyId && e.ExpenseDate >= fromDate && e.ExpenseDate <= toDate && e.Status == ExpenseStatus.Paid)
            .ToListAsync();
        var inputVat = expenses.Sum(e => e.VatAmount);
        
        var vatToPay = outputVat - inputVat;

        if (existingPayment == null)
        {
            existingPayment = new VatPayment
            {
                CompanyId = companyId,
                Year = request.Year,
                Period = request.Period,
                PeriodType = request.PeriodType,
                OutputVat = outputVat,
                InputVat = inputVat,
                VatToPay = vatToPay,
                IsPaid = true,
                PaidAt = DateTime.UtcNow,
                PaidAmount = request.PaidAmount ?? vatToPay,
                PaymentReference = request.PaymentReference,
                Notes = request.Notes,
                CreatedAt = DateTime.UtcNow
            };
            _context.VatPayments.Add(existingPayment);
        }
        else
        {
            existingPayment.OutputVat = outputVat;
            existingPayment.InputVat = inputVat;
            existingPayment.VatToPay = vatToPay;
            existingPayment.IsPaid = true;
            existingPayment.PaidAt = DateTime.UtcNow;
            existingPayment.PaidAmount = request.PaidAmount ?? vatToPay;
            existingPayment.PaymentReference = request.PaymentReference;
            existingPayment.Notes = request.Notes;
            existingPayment.UpdatedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();

        return new VatPeriodDto(
            Year: existingPayment.Year,
            Period: existingPayment.Period,
            PeriodType: existingPayment.PeriodType,
            PeriodName: GetPeriodName(existingPayment.Period, existingPayment.PeriodType),
            FromDate: fromDate,
            ToDate: toDate,
            OutputVat: existingPayment.OutputVat,
            InputVat: existingPayment.InputVat,
            VatToPay: existingPayment.VatToPay,
            IsPaid: existingPayment.IsPaid,
            PaidAt: existingPayment.PaidAt,
            PaidAmount: existingPayment.PaidAmount,
            PaymentReference: existingPayment.PaymentReference,
            Notes: existingPayment.Notes
        );
    }

    public async Task<bool> UnmarkAsPaidAsync(int companyId, int year, int period, VatPeriodType periodType)
    {
        var payment = await _context.VatPayments
            .FirstOrDefaultAsync(v => 
                v.CompanyId == companyId && 
                v.Year == year && 
                v.Period == period && 
                v.PeriodType == periodType);

        if (payment == null) return false;

        payment.IsPaid = false;
        payment.PaidAt = null;
        payment.PaidAmount = null;
        payment.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return true;
    }

    private static (DateTime FromDate, DateTime ToDate) GetPeriodDates(int year, int period, VatPeriodType periodType)
    {
        return periodType switch
        {
            VatPeriodType.Monthly => (
                new DateTime(year, period, 1),
                new DateTime(year, period, DateTime.DaysInMonth(year, period))
            ),
            VatPeriodType.Quarterly => period switch
            {
                1 => (new DateTime(year, 1, 1), new DateTime(year, 3, 31)),
                2 => (new DateTime(year, 4, 1), new DateTime(year, 6, 30)),
                3 => (new DateTime(year, 7, 1), new DateTime(year, 9, 30)),
                4 => (new DateTime(year, 10, 1), new DateTime(year, 12, 31)),
                _ => (new DateTime(year, 1, 1), new DateTime(year, 12, 31))
            },
            VatPeriodType.Yearly => (
                new DateTime(year, 1, 1),
                new DateTime(year, 12, 31)
            ),
            _ => (new DateTime(year, 1, 1), new DateTime(year, 12, 31))
        };
    }

    private static string GetPeriodName(int period, VatPeriodType periodType)
    {
        return periodType switch
        {
            VatPeriodType.Monthly => period switch
            {
                1 => "Januari",
                2 => "Februari",
                3 => "Mars",
                4 => "April",
                5 => "Maj",
                6 => "Juni",
                7 => "Juli",
                8 => "Augusti",
                9 => "September",
                10 => "Oktober",
                11 => "November",
                12 => "December",
                _ => $"Månad {period}"
            },
            VatPeriodType.Quarterly => $"Q{period}",
            VatPeriodType.Yearly => "Helår",
            _ => $"Period {period}"
        };
    }
}



