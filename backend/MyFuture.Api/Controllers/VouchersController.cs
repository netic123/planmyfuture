using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyFuture.Api.DTOs;
using MyFuture.Api.Services;

namespace MyFuture.Api.Controllers;

[ApiController]
[Route("api/companies/{companyId}/[controller]")]
[Authorize]
public class VouchersController : ControllerBase
{
    private readonly IVoucherService _voucherService;

    public VouchersController(IVoucherService voucherService)
    {
        _voucherService = voucherService;
    }

    [HttpGet]
    public async Task<ActionResult<List<VoucherListDto>>> GetVouchers(int companyId)
    {
        var vouchers = await _voucherService.GetVouchersAsync(companyId);
        return Ok(vouchers);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<VoucherDto>> GetVoucher(int companyId, int id)
    {
        var voucher = await _voucherService.GetVoucherAsync(id, companyId);
        if (voucher == null)
        {
            return NotFound();
        }
        return Ok(voucher);
    }

    [HttpPost]
    public async Task<ActionResult<VoucherDto>> CreateVoucher(int companyId, CreateVoucherRequest request)
    {
        var voucher = await _voucherService.CreateVoucherAsync(request, companyId);
        if (voucher == null)
        {
            return BadRequest(new { message = "Debit must equal credit, or invalid account" });
        }
        return CreatedAtAction(nameof(GetVoucher), new { companyId, id = voucher.Id }, voucher);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteVoucher(int companyId, int id)
    {
        var result = await _voucherService.DeleteVoucherAsync(id, companyId);
        if (!result)
        {
            return NotFound();
        }
        return NoContent();
    }
}

