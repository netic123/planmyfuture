using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyFuture.Api.DTOs;
using MyFuture.Api.Services;

namespace MyFuture.Api.Controllers;

[ApiController]
[Route("api/companies/{companyId}/[controller]")]
[Authorize]
public class EmployeesController : ControllerBase
{
    private readonly IEmployeeService _employeeService;

    public EmployeesController(IEmployeeService employeeService)
    {
        _employeeService = employeeService;
    }

    [HttpGet]
    public async Task<ActionResult<List<EmployeeDto>>> GetEmployees(int companyId)
    {
        var employees = await _employeeService.GetEmployeesAsync(companyId);
        return Ok(employees);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<EmployeeDto>> GetEmployee(int companyId, int id)
    {
        var employee = await _employeeService.GetEmployeeAsync(id, companyId);
        if (employee == null)
        {
            return NotFound();
        }
        return Ok(employee);
    }

    [HttpPost]
    public async Task<ActionResult<EmployeeDto>> CreateEmployee(int companyId, CreateEmployeeRequest request)
    {
        var employee = await _employeeService.CreateEmployeeAsync(request, companyId);
        return CreatedAtAction(nameof(GetEmployee), new { companyId, id = employee!.Id }, employee);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<EmployeeDto>> UpdateEmployee(int companyId, int id, UpdateEmployeeRequest request)
    {
        var employee = await _employeeService.UpdateEmployeeAsync(id, request, companyId);
        if (employee == null)
        {
            return NotFound();
        }
        return Ok(employee);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteEmployee(int companyId, int id)
    {
        var result = await _employeeService.DeleteEmployeeAsync(id, companyId);
        if (!result)
        {
            return NotFound();
        }
        return NoContent();
    }

    [HttpGet("salaries")]
    public async Task<ActionResult<List<SalaryDto>>> GetSalaries(int companyId, [FromQuery] int? year = null, [FromQuery] int? month = null)
    {
        var salaries = await _employeeService.GetSalariesAsync(companyId, year, month);
        return Ok(salaries);
    }

    [HttpPost("salaries")]
    public async Task<ActionResult<SalaryDto>> CreateSalary(int companyId, CreateSalaryRequest request)
    {
        var salary = await _employeeService.CreateSalaryAsync(request, companyId);
        if (salary == null)
        {
            return BadRequest(new { message = "Salary already exists for this month or employee is inactive" });
        }
        return Ok(salary);
    }

    [HttpPost("salaries/{id}/pay")]
    public async Task<IActionResult> MarkSalaryAsPaid(int companyId, int id)
    {
        var result = await _employeeService.MarkSalaryAsPaidAsync(id, companyId);
        if (!result)
        {
            return NotFound();
        }
        return NoContent();
    }
}

