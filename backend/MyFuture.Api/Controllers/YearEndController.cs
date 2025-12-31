using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyFuture.Api.DTOs;
using MyFuture.Api.Services;

namespace MyFuture.Api.Controllers;

[ApiController]
[Route("api/companies/{companyId}/year-end")]
[Authorize]
public class YearEndController : ControllerBase
{
    private readonly IYearEndService _yearEndService;

    public YearEndController(IYearEndService yearEndService)
    {
        _yearEndService = yearEndService;
    }

    [HttpGet("{fiscalYear}")]
    public async Task<ActionResult<YearEndSummary>> GetYearEndSummary(int companyId, int fiscalYear)
    {
        try
        {
            var summary = await _yearEndService.GetYearEndSummaryAsync(companyId, fiscalYear);
            return Ok(summary);
        }
        catch (ArgumentException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpGet("{fiscalYear}/tax")]
    public async Task<ActionResult<TaxCalculation>> GetTaxCalculation(int companyId, int fiscalYear)
    {
        try
        {
            var calculation = await _yearEndService.GetTaxCalculationAsync(companyId, fiscalYear);
            return Ok(calculation);
        }
        catch (ArgumentException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpPost("{fiscalYear}/close")]
    public async Task<ActionResult<CloseYearResult>> CloseYear(int companyId, int fiscalYear)
    {
        var result = await _yearEndService.CloseYearAsync(companyId, fiscalYear);
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }
}



