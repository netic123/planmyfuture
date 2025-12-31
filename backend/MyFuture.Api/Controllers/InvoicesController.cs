using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyFuture.Api.DTOs;
using MyFuture.Api.Services;

namespace MyFuture.Api.Controllers;

[ApiController]
[Route("api/companies/{companyId}/[controller]")]
[Authorize]
public class InvoicesController : ControllerBase
{
    private readonly IInvoiceService _invoiceService;

    public InvoicesController(IInvoiceService invoiceService)
    {
        _invoiceService = invoiceService;
    }

    [HttpGet]
    public async Task<ActionResult<List<InvoiceListDto>>> GetInvoices(int companyId)
    {
        var invoices = await _invoiceService.GetInvoicesAsync(companyId);
        return Ok(invoices);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<InvoiceDto>> GetInvoice(int companyId, int id)
    {
        var invoice = await _invoiceService.GetInvoiceAsync(id, companyId);
        if (invoice == null)
        {
            return NotFound();
        }
        return Ok(invoice);
    }

    [HttpPost]
    public async Task<ActionResult<InvoiceDto>> CreateInvoice(int companyId, CreateInvoiceRequest request)
    {
        var invoice = await _invoiceService.CreateInvoiceAsync(request, companyId);
        if (invoice == null)
        {
            return BadRequest(new { message = "Invalid customer or request" });
        }
        return CreatedAtAction(nameof(GetInvoice), new { companyId, id = invoice.Id }, invoice);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<InvoiceDto>> UpdateInvoice(int companyId, int id, UpdateInvoiceRequest request)
    {
        var invoice = await _invoiceService.UpdateInvoiceAsync(id, request, companyId);
        if (invoice == null)
        {
            return NotFound();
        }
        return Ok(invoice);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteInvoice(int companyId, int id)
    {
        var result = await _invoiceService.DeleteInvoiceAsync(id, companyId);
        if (!result)
        {
            return NotFound();
        }
        return NoContent();
    }

    [HttpPost("{id}/send")]
    public async Task<IActionResult> SendInvoice(int companyId, int id)
    {
        var result = await _invoiceService.MarkAsSentAsync(id, companyId);
        if (!result)
        {
            return BadRequest(new { message = "Invoice cannot be sent" });
        }
        return NoContent();
    }

    [HttpPost("{id}/pay")]
    public async Task<IActionResult> MarkAsPaid(int companyId, int id)
    {
        var result = await _invoiceService.MarkAsPaidAsync(id, companyId);
        if (!result)
        {
            return BadRequest(new { message = "Invoice cannot be marked as paid" });
        }
        return NoContent();
    }
}

