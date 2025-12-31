using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyFuture.Api.DTOs;
using MyFuture.Api.Services;

namespace MyFuture.Api.Controllers;

[ApiController]
[Route("api/companies/{companyId}/[controller]")]
[Authorize]
public class ReportsController : ControllerBase
{
    private readonly IReportService _reportService;

    public ReportsController(IReportService reportService)
    {
        _reportService = reportService;
    }

    [HttpGet("dashboard")]
    public async Task<ActionResult<DashboardDto>> GetDashboard(int companyId)
    {
        var dashboard = await _reportService.GetDashboardAsync(companyId);
        return Ok(dashboard);
    }

    [HttpGet("income-statement")]
    public async Task<ActionResult<IncomeStatementDto>> GetIncomeStatement(
        int companyId, 
        [FromQuery] DateTime? fromDate = null, 
        [FromQuery] DateTime? toDate = null)
    {
        var from = fromDate ?? new DateTime(DateTime.UtcNow.Year, 1, 1);
        var to = toDate ?? DateTime.UtcNow;
        var statement = await _reportService.GetIncomeStatementAsync(companyId, from, to);
        return Ok(statement);
    }

    [HttpGet("balance-sheet")]
    public async Task<ActionResult<BalanceSheetDto>> GetBalanceSheet(
        int companyId, 
        [FromQuery] DateTime? asOfDate = null)
    {
        var date = asOfDate ?? DateTime.UtcNow;
        var sheet = await _reportService.GetBalanceSheetAsync(companyId, date);
        return Ok(sheet);
    }

    [HttpGet("vat")]
    public async Task<ActionResult<VatReportDto>> GetVatReport(
        int companyId, 
        [FromQuery] DateTime? fromDate = null, 
        [FromQuery] DateTime? toDate = null)
    {
        var from = fromDate ?? new DateTime(DateTime.UtcNow.Year, 1, 1);
        var to = toDate ?? DateTime.UtcNow;
        var report = await _reportService.GetVatReportAsync(companyId, from, to);
        return Ok(report);
    }
}

