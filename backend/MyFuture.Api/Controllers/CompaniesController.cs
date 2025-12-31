using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyFuture.Api.DTOs;
using MyFuture.Api.Services;
using System.Security.Claims;

namespace MyFuture.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CompaniesController : ControllerBase
{
    private readonly ICompanyService _companyService;

    public CompaniesController(ICompanyService companyService)
    {
        _companyService = companyService;
    }

    private int UserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<ActionResult<List<CompanyDto>>> GetCompanies()
    {
        var companies = await _companyService.GetCompaniesAsync(UserId);
        return Ok(companies);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<CompanyDto>> GetCompany(int id)
    {
        var company = await _companyService.GetCompanyAsync(id, UserId);
        if (company == null)
        {
            return NotFound();
        }
        return Ok(company);
    }

    [HttpPost]
    public async Task<ActionResult<CompanyDto>> CreateCompany(CreateCompanyRequest request)
    {
        var company = await _companyService.CreateCompanyAsync(request, UserId);
        return CreatedAtAction(nameof(GetCompany), new { id = company!.Id }, company);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<CompanyDto>> UpdateCompany(int id, UpdateCompanyRequest request)
    {
        var company = await _companyService.UpdateCompanyAsync(id, request, UserId);
        if (company == null)
        {
            return NotFound();
        }
        return Ok(company);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCompany(int id)
    {
        var result = await _companyService.DeleteCompanyAsync(id, UserId);
        if (!result)
        {
            return NotFound();
        }
        return NoContent();
    }
}

