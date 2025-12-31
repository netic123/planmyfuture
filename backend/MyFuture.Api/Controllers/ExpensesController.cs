using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyFuture.Api.DTOs;
using MyFuture.Api.Services;

namespace MyFuture.Api.Controllers;

[ApiController]
[Route("api/companies/{companyId}/[controller]")]
[Authorize]
public class ExpensesController : ControllerBase
{
    private readonly IExpenseService _expenseService;

    public ExpensesController(IExpenseService expenseService)
    {
        _expenseService = expenseService;
    }

    [HttpGet]
    public async Task<ActionResult<List<ExpenseListDto>>> GetExpenses(int companyId)
    {
        var expenses = await _expenseService.GetExpensesAsync(companyId);
        return Ok(expenses);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ExpenseDto>> GetExpense(int companyId, int id)
    {
        var expense = await _expenseService.GetExpenseAsync(id, companyId);
        if (expense == null)
        {
            return NotFound();
        }
        return Ok(expense);
    }

    [HttpPost]
    public async Task<ActionResult<ExpenseDto>> CreateExpense(int companyId, CreateExpenseRequest request)
    {
        var expense = await _expenseService.CreateExpenseAsync(request, companyId);
        if (expense == null)
        {
            return BadRequest(new { message = "Failed to create expense" });
        }
        return CreatedAtAction(nameof(GetExpense), new { companyId, id = expense.Id }, expense);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ExpenseDto>> UpdateExpense(int companyId, int id, UpdateExpenseRequest request)
    {
        var expense = await _expenseService.UpdateExpenseAsync(id, request, companyId);
        if (expense == null)
        {
            return NotFound();
        }
        return Ok(expense);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteExpense(int companyId, int id)
    {
        var result = await _expenseService.DeleteExpenseAsync(id, companyId);
        if (!result)
        {
            return NotFound();
        }
        return NoContent();
    }

    [HttpPost("{id}/submit")]
    public async Task<IActionResult> SubmitExpense(int companyId, int id)
    {
        var result = await _expenseService.SubmitExpenseAsync(id, companyId);
        if (!result)
        {
            return BadRequest(new { message = "Expense cannot be submitted" });
        }
        return NoContent();
    }

    [HttpPost("{id}/approve")]
    public async Task<IActionResult> ApproveExpense(int companyId, int id)
    {
        var result = await _expenseService.ApproveExpenseAsync(id, companyId);
        if (!result)
        {
            return BadRequest(new { message = "Expense cannot be approved" });
        }
        return NoContent();
    }

    [HttpPost("{id}/reject")]
    public async Task<IActionResult> RejectExpense(int companyId, int id)
    {
        var result = await _expenseService.RejectExpenseAsync(id, companyId);
        if (!result)
        {
            return BadRequest(new { message = "Expense cannot be rejected" });
        }
        return NoContent();
    }

    [HttpPost("{id}/pay")]
    public async Task<IActionResult> MarkAsPaid(int companyId, int id)
    {
        var result = await _expenseService.MarkAsPaidAsync(id, companyId);
        if (!result)
        {
            return BadRequest(new { message = "Expense cannot be marked as paid" });
        }
        return NoContent();
    }
}



