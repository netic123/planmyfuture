using Microsoft.EntityFrameworkCore;
using MyFuture.Api.Data;
using MyFuture.Api.DTOs;
using MyFuture.Api.Models;

namespace MyFuture.Api.Services;

public interface ICustomerService
{
    Task<List<CustomerDto>> GetCustomersAsync(int companyId);
    Task<CustomerDto?> GetCustomerAsync(int customerId, int companyId);
    Task<CustomerDto?> CreateCustomerAsync(CreateCustomerRequest request, int companyId);
    Task<CustomerDto?> UpdateCustomerAsync(int customerId, UpdateCustomerRequest request, int companyId);
    Task<bool> DeleteCustomerAsync(int customerId, int companyId);
}

public class CustomerService : ICustomerService
{
    private readonly AppDbContext _context;

    public CustomerService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<CustomerDto>> GetCustomersAsync(int companyId)
    {
        return await _context.Customers
            .Where(c => c.CompanyId == companyId)
            .OrderBy(c => c.CustomerNumber)
            .Select(c => ToDto(c))
            .ToListAsync();
    }

    public async Task<CustomerDto?> GetCustomerAsync(int customerId, int companyId)
    {
        var customer = await _context.Customers
            .FirstOrDefaultAsync(c => c.Id == customerId && c.CompanyId == companyId);

        return customer != null ? ToDto(customer) : null;
    }

    public async Task<CustomerDto?> CreateCustomerAsync(CreateCustomerRequest request, int companyId)
    {
        // Hämta alla kundnummer till minnet för att undvika SQLite-begränsning med int.Parse
        var customerNumbers = await _context.Customers
            .Where(c => c.CompanyId == companyId)
            .Select(c => c.CustomerNumber)
            .ToListAsync();

        var nextNumber = customerNumbers
            .Select(n => int.TryParse(n, out var num) ? num : 0)
            .DefaultIfEmpty(0)
            .Max();

        var customer = new Customer
        {
            CustomerNumber = (nextNumber + 1).ToString().PadLeft(4, '0'),
            Name = request.Name,
            OrganizationNumber = request.OrganizationNumber,
            Address = request.Address,
            PostalCode = request.PostalCode,
            City = request.City,
            Country = request.Country ?? "Sverige",
            Phone = request.Phone,
            Email = request.Email,
            PaymentTermsDays = request.PaymentTermsDays,
            CompanyId = companyId,
            CreatedAt = DateTime.UtcNow
        };

        _context.Customers.Add(customer);
        await _context.SaveChangesAsync();

        return ToDto(customer);
    }

    public async Task<CustomerDto?> UpdateCustomerAsync(int customerId, UpdateCustomerRequest request, int companyId)
    {
        var customer = await _context.Customers
            .FirstOrDefaultAsync(c => c.Id == customerId && c.CompanyId == companyId);

        if (customer == null) return null;

        customer.Name = request.Name;
        customer.OrganizationNumber = request.OrganizationNumber;
        customer.Address = request.Address;
        customer.PostalCode = request.PostalCode;
        customer.City = request.City;
        customer.Country = request.Country;
        customer.Phone = request.Phone;
        customer.Email = request.Email;
        customer.PaymentTermsDays = request.PaymentTermsDays;

        await _context.SaveChangesAsync();
        return ToDto(customer);
    }

    public async Task<bool> DeleteCustomerAsync(int customerId, int companyId)
    {
        var customer = await _context.Customers
            .FirstOrDefaultAsync(c => c.Id == customerId && c.CompanyId == companyId);

        if (customer == null) return false;

        _context.Customers.Remove(customer);
        await _context.SaveChangesAsync();
        return true;
    }

    private static CustomerDto ToDto(Customer customer) => new(
        customer.Id,
        customer.CustomerNumber,
        customer.Name,
        customer.OrganizationNumber,
        customer.Address,
        customer.PostalCode,
        customer.City,
        customer.Country,
        customer.Phone,
        customer.Email,
        customer.PaymentTermsDays,
        customer.CreatedAt
    );
}

