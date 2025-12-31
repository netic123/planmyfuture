using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyFuture.Api.DTOs;
using MyFuture.Api.Services;

namespace MyFuture.Api.Controllers;

[ApiController]
[Route("api/companies/{companyId}/[controller]")]
[Authorize]
public class CustomersController : ControllerBase
{
    private readonly ICustomerService _customerService;

    public CustomersController(ICustomerService customerService)
    {
        _customerService = customerService;
    }

    [HttpGet]
    public async Task<ActionResult<List<CustomerDto>>> GetCustomers(int companyId)
    {
        var customers = await _customerService.GetCustomersAsync(companyId);
        return Ok(customers);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<CustomerDto>> GetCustomer(int companyId, int id)
    {
        var customer = await _customerService.GetCustomerAsync(id, companyId);
        if (customer == null)
        {
            return NotFound();
        }
        return Ok(customer);
    }

    [HttpPost]
    public async Task<ActionResult<CustomerDto>> CreateCustomer(int companyId, CreateCustomerRequest request)
    {
        var customer = await _customerService.CreateCustomerAsync(request, companyId);
        return CreatedAtAction(nameof(GetCustomer), new { companyId, id = customer!.Id }, customer);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<CustomerDto>> UpdateCustomer(int companyId, int id, UpdateCustomerRequest request)
    {
        var customer = await _customerService.UpdateCustomerAsync(id, request, companyId);
        if (customer == null)
        {
            return NotFound();
        }
        return Ok(customer);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCustomer(int companyId, int id)
    {
        var result = await _customerService.DeleteCustomerAsync(id, companyId);
        if (!result)
        {
            return NotFound();
        }
        return NoContent();
    }
}

