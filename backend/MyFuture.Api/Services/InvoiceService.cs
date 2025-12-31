using Microsoft.EntityFrameworkCore;
using MyFuture.Api.Data;
using MyFuture.Api.DTOs;
using MyFuture.Api.Models;

namespace MyFuture.Api.Services;

public interface IInvoiceService
{
    Task<List<InvoiceListDto>> GetInvoicesAsync(int companyId);
    Task<InvoiceDto?> GetInvoiceAsync(int invoiceId, int companyId);
    Task<InvoiceDto?> CreateInvoiceAsync(CreateInvoiceRequest request, int companyId);
    Task<InvoiceDto?> UpdateInvoiceAsync(int invoiceId, UpdateInvoiceRequest request, int companyId);
    Task<bool> DeleteInvoiceAsync(int invoiceId, int companyId);
    Task<bool> MarkAsSentAsync(int invoiceId, int companyId);
    Task<bool> MarkAsPaidAsync(int invoiceId, int companyId);
}

public class InvoiceService : IInvoiceService
{
    private readonly AppDbContext _context;

    public InvoiceService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<InvoiceListDto>> GetInvoicesAsync(int companyId)
    {
        return await _context.Invoices
            .Where(i => i.CompanyId == companyId)
            .Include(i => i.Customer)
            .OrderByDescending(i => i.InvoiceDate)
            .Select(i => new InvoiceListDto(
                i.Id,
                i.InvoiceNumber,
                i.InvoiceDate,
                i.DueDate,
                i.Status,
                i.TotalIncludingVat,
                i.Customer.Name
            ))
            .ToListAsync();
    }

    public async Task<InvoiceDto?> GetInvoiceAsync(int invoiceId, int companyId)
    {
        var invoice = await _context.Invoices
            .Include(i => i.Customer)
            .Include(i => i.Lines)
            .FirstOrDefaultAsync(i => i.Id == invoiceId && i.CompanyId == companyId);

        return invoice != null ? ToDto(invoice) : null;
    }

    public async Task<InvoiceDto?> CreateInvoiceAsync(CreateInvoiceRequest request, int companyId)
    {
        var customer = await _context.Customers
            .FirstOrDefaultAsync(c => c.Id == request.CustomerId && c.CompanyId == companyId);

        if (customer == null) return null;

        // Hämta alla fakturanummer till minnet för att undvika SQLite-begränsning med int.Parse
        var invoiceNumbers = await _context.Invoices
            .Where(i => i.CompanyId == companyId)
            .Select(i => i.InvoiceNumber)
            .ToListAsync();

        var nextNumber = invoiceNumbers
            .Select(n => int.TryParse(n, out var num) ? num : 0)
            .DefaultIfEmpty(0)
            .Max();

        var invoice = new Invoice
        {
            InvoiceNumber = (nextNumber + 1).ToString().PadLeft(6, '0'),
            InvoiceDate = request.InvoiceDate,
            DueDate = request.DueDate,
            Reference = request.Reference,
            Notes = request.Notes,
            CustomerId = request.CustomerId,
            CompanyId = companyId,
            Status = InvoiceStatus.Draft,
            CreatedAt = DateTime.UtcNow
        };

        var sortOrder = 0;
        foreach (var lineRequest in request.Lines)
        {
            var totalExVat = lineRequest.Quantity * lineRequest.UnitPrice;
            var vatAmount = totalExVat * (lineRequest.VatRate / 100);

            invoice.Lines.Add(new InvoiceLine
            {
                Description = lineRequest.Description,
                Quantity = lineRequest.Quantity,
                Unit = lineRequest.Unit,
                UnitPrice = lineRequest.UnitPrice,
                VatRate = lineRequest.VatRate,
                TotalExcludingVat = totalExVat,
                VatAmount = vatAmount,
                TotalIncludingVat = totalExVat + vatAmount,
                SortOrder = sortOrder++
            });
        }

        invoice.TotalExcludingVat = invoice.Lines.Sum(l => l.TotalExcludingVat);
        invoice.VatAmount = invoice.Lines.Sum(l => l.VatAmount);
        invoice.TotalIncludingVat = invoice.Lines.Sum(l => l.TotalIncludingVat);

        _context.Invoices.Add(invoice);
        await _context.SaveChangesAsync();

        return await GetInvoiceAsync(invoice.Id, companyId);
    }

    public async Task<InvoiceDto?> UpdateInvoiceAsync(int invoiceId, UpdateInvoiceRequest request, int companyId)
    {
        var invoice = await _context.Invoices
            .Include(i => i.Lines)
            .FirstOrDefaultAsync(i => i.Id == invoiceId && i.CompanyId == companyId);

        if (invoice == null || invoice.Status != InvoiceStatus.Draft) return null;

        invoice.CustomerId = request.CustomerId;
        invoice.InvoiceDate = request.InvoiceDate;
        invoice.DueDate = request.DueDate;
        invoice.Reference = request.Reference;
        invoice.Notes = request.Notes;

        // Remove old lines
        _context.InvoiceLines.RemoveRange(invoice.Lines);

        // Add new lines
        var sortOrder = 0;
        foreach (var lineRequest in request.Lines)
        {
            var totalExVat = lineRequest.Quantity * lineRequest.UnitPrice;
            var vatAmount = totalExVat * (lineRequest.VatRate / 100);

            invoice.Lines.Add(new InvoiceLine
            {
                Description = lineRequest.Description,
                Quantity = lineRequest.Quantity,
                Unit = lineRequest.Unit,
                UnitPrice = lineRequest.UnitPrice,
                VatRate = lineRequest.VatRate,
                TotalExcludingVat = totalExVat,
                VatAmount = vatAmount,
                TotalIncludingVat = totalExVat + vatAmount,
                SortOrder = sortOrder++
            });
        }

        invoice.TotalExcludingVat = invoice.Lines.Sum(l => l.TotalExcludingVat);
        invoice.VatAmount = invoice.Lines.Sum(l => l.VatAmount);
        invoice.TotalIncludingVat = invoice.Lines.Sum(l => l.TotalIncludingVat);

        await _context.SaveChangesAsync();
        return await GetInvoiceAsync(invoice.Id, companyId);
    }

    public async Task<bool> DeleteInvoiceAsync(int invoiceId, int companyId)
    {
        var invoice = await _context.Invoices
            .FirstOrDefaultAsync(i => i.Id == invoiceId && i.CompanyId == companyId);

        if (invoice == null || invoice.Status != InvoiceStatus.Draft) return false;

        _context.Invoices.Remove(invoice);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> MarkAsSentAsync(int invoiceId, int companyId)
    {
        var invoice = await _context.Invoices
            .FirstOrDefaultAsync(i => i.Id == invoiceId && i.CompanyId == companyId);

        if (invoice == null || invoice.Status != InvoiceStatus.Draft) return false;

        invoice.Status = InvoiceStatus.Sent;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> MarkAsPaidAsync(int invoiceId, int companyId)
    {
        var invoice = await _context.Invoices
            .FirstOrDefaultAsync(i => i.Id == invoiceId && i.CompanyId == companyId);

        if (invoice == null || (invoice.Status != InvoiceStatus.Sent && invoice.Status != InvoiceStatus.Overdue)) 
            return false;

        invoice.Status = InvoiceStatus.Paid;
        invoice.PaidAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return true;
    }

    private static InvoiceDto ToDto(Invoice invoice) => new(
        invoice.Id,
        invoice.InvoiceNumber,
        invoice.InvoiceDate,
        invoice.DueDate,
        invoice.Status,
        invoice.TotalExcludingVat,
        invoice.VatAmount,
        invoice.TotalIncludingVat,
        invoice.Reference,
        invoice.Notes,
        invoice.CreatedAt,
        invoice.PaidAt,
        new CustomerDto(
            invoice.Customer.Id,
            invoice.Customer.CustomerNumber,
            invoice.Customer.Name,
            invoice.Customer.OrganizationNumber,
            invoice.Customer.Address,
            invoice.Customer.PostalCode,
            invoice.Customer.City,
            invoice.Customer.Country,
            invoice.Customer.Phone,
            invoice.Customer.Email,
            invoice.Customer.PaymentTermsDays,
            invoice.Customer.CreatedAt
        ),
        invoice.Lines.OrderBy(l => l.SortOrder).Select(l => new InvoiceLineDto(
            l.Id,
            l.Description,
            l.Quantity,
            l.Unit,
            l.UnitPrice,
            l.VatRate,
            l.TotalExcludingVat,
            l.VatAmount,
            l.TotalIncludingVat
        )).ToList()
    );
}

