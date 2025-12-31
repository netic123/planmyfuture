using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyFuture.Api.DTOs;
using MyFuture.Api.Models;
using MyFuture.Api.Services;

namespace MyFuture.Api.Controllers;

[ApiController]
[Route("api/companies/{companyId}/[controller]")]
[Authorize]
public class VatController : ControllerBase
{
    private readonly IVatService _vatService;

    public VatController(IVatService vatService)
    {
        _vatService = vatService;
    }

    [HttpGet("{year}")]
    public async Task<ActionResult<VatSummaryDto>> GetVatSummary(
        int companyId, 
        int year, 
        [FromQuery] VatPeriodType periodType = VatPeriodType.Quarterly)
    {
        var summary = await _vatService.GetVatSummaryAsync(companyId, year, periodType);
        return Ok(summary);
    }

    [HttpPost("mark-paid")]
    public async Task<ActionResult<VatPeriodDto>> MarkAsPaid(int companyId, MarkVatPaidRequest request)
    {
        var result = await _vatService.MarkAsPaidAsync(companyId, request);
        if (result == null) return BadRequest("Kunde inte markera perioden som betald.");
        return Ok(result);
    }

    [HttpPost("{year}/{period}/unmark-paid")]
    public async Task<IActionResult> UnmarkAsPaid(
        int companyId, 
        int year, 
        int period, 
        [FromQuery] VatPeriodType periodType = VatPeriodType.Quarterly)
    {
        var result = await _vatService.UnmarkAsPaidAsync(companyId, year, period, periodType);
        if (!result) return NotFound();
        return NoContent();
    }
}



