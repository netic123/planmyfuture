using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyFuture.Api.DTOs;
using MyFuture.Api.Services;
using System.Security.Claims;

namespace MyFuture.Api.Controllers;

[ApiController]
[Route("api/personal-finance")]
[Authorize]
public class PersonalFinanceController : ControllerBase
{
    private readonly IPersonalFinanceService _financeService;

    public PersonalFinanceController(IPersonalFinanceService financeService)
    {
        _financeService = financeService;
    }

    private int GetUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    // === Dashboard ===
    
    [HttpGet("summary")]
    public async Task<ActionResult<PersonalFinanceSummary>> GetSummary()
    {
        var summary = await _financeService.GetFinanceSummaryAsync(GetUserId());
        return Ok(summary);
    }

    // === Budget ===
    
    [HttpGet("budget")]
    public async Task<ActionResult<BudgetSummary>> GetBudgetSummary()
    {
        var summary = await _financeService.GetBudgetSummaryAsync(GetUserId());
        return Ok(summary);
    }

    [HttpGet("budget/items")]
    public async Task<ActionResult<List<PersonalBudgetDto>>> GetBudgetItems()
    {
        var items = await _financeService.GetBudgetItemsAsync(GetUserId());
        return Ok(items);
    }

    [HttpPost("budget/items")]
    public async Task<ActionResult<PersonalBudgetDto>> CreateBudgetItem(CreateBudgetItemRequest request)
    {
        var item = await _financeService.CreateBudgetItemAsync(request, GetUserId());
        if (item == null) return BadRequest();
        return CreatedAtAction(nameof(GetBudgetItems), item);
    }

    [HttpPut("budget/items/{id}")]
    public async Task<ActionResult<PersonalBudgetDto>> UpdateBudgetItem(int id, UpdateBudgetItemRequest request)
    {
        var item = await _financeService.UpdateBudgetItemAsync(id, request, GetUserId());
        if (item == null) return NotFound();
        return Ok(item);
    }

    [HttpDelete("budget/items/{id}")]
    public async Task<IActionResult> DeleteBudgetItem(int id)
    {
        var result = await _financeService.DeleteBudgetItemAsync(id, GetUserId());
        if (!result) return NotFound();
        return NoContent();
    }

    // === Financial Accounts ===
    
    [HttpGet("accounts")]
    public async Task<ActionResult<List<FinancialAccountDto>>> GetAccounts()
    {
        var accounts = await _financeService.GetAccountsAsync(GetUserId());
        return Ok(accounts);
    }

    [HttpGet("accounts/{id}")]
    public async Task<ActionResult<FinancialAccountDto>> GetAccount(int id)
    {
        var account = await _financeService.GetAccountAsync(id, GetUserId());
        if (account == null) return NotFound();
        return Ok(account);
    }

    [HttpPost("accounts")]
    public async Task<ActionResult<FinancialAccountDto>> CreateAccount(CreateFinancialAccountRequest request)
    {
        var account = await _financeService.CreateAccountAsync(request, GetUserId());
        if (account == null) return BadRequest();
        return CreatedAtAction(nameof(GetAccount), new { id = account.Id }, account);
    }

    [HttpPut("accounts/{id}")]
    public async Task<ActionResult<FinancialAccountDto>> UpdateAccount(int id, UpdateFinancialAccountRequest request)
    {
        var account = await _financeService.UpdateAccountAsync(id, request, GetUserId());
        if (account == null) return NotFound();
        return Ok(account);
    }

    [HttpDelete("accounts/{id}")]
    public async Task<IActionResult> DeleteAccount(int id)
    {
        var result = await _financeService.DeleteAccountAsync(id, GetUserId());
        if (!result) return NotFound();
        return NoContent();
    }

    // === Debts ===
    
    [HttpGet("debts")]
    public async Task<ActionResult<List<DebtDto>>> GetDebts()
    {
        var debts = await _financeService.GetDebtsAsync(GetUserId());
        return Ok(debts);
    }

    [HttpGet("debts/{id}")]
    public async Task<ActionResult<DebtDto>> GetDebt(int id)
    {
        var debt = await _financeService.GetDebtAsync(id, GetUserId());
        if (debt == null) return NotFound();
        return Ok(debt);
    }

    [HttpPost("debts")]
    public async Task<ActionResult<DebtDto>> CreateDebt(CreateDebtRequest request)
    {
        var debt = await _financeService.CreateDebtAsync(request, GetUserId());
        if (debt == null) return BadRequest();
        return CreatedAtAction(nameof(GetDebt), new { id = debt.Id }, debt);
    }

    [HttpPut("debts/{id}")]
    public async Task<ActionResult<DebtDto>> UpdateDebt(int id, UpdateDebtRequest request)
    {
        var debt = await _financeService.UpdateDebtAsync(id, request, GetUserId());
        if (debt == null) return NotFound();
        return Ok(debt);
    }

    [HttpDelete("debts/{id}")]
    public async Task<IActionResult> DeleteDebt(int id)
    {
        var result = await _financeService.DeleteDebtAsync(id, GetUserId());
        if (!result) return NotFound();
        return NoContent();
    }

    // === Goals ===
    
    [HttpGet("goals")]
    public async Task<ActionResult<List<FinancialGoalDto>>> GetGoals()
    {
        var goals = await _financeService.GetGoalsAsync(GetUserId());
        return Ok(goals);
    }

    [HttpGet("goals/{id}")]
    public async Task<ActionResult<FinancialGoalDto>> GetGoal(int id)
    {
        var goal = await _financeService.GetGoalAsync(id, GetUserId());
        if (goal == null) return NotFound();
        return Ok(goal);
    }

    [HttpPost("goals")]
    public async Task<ActionResult<FinancialGoalDto>> CreateGoal(CreateGoalRequest request)
    {
        var goal = await _financeService.CreateGoalAsync(request, GetUserId());
        if (goal == null) return BadRequest();
        return CreatedAtAction(nameof(GetGoal), new { id = goal.Id }, goal);
    }

    [HttpPut("goals/{id}")]
    public async Task<ActionResult<FinancialGoalDto>> UpdateGoal(int id, UpdateGoalRequest request)
    {
        var goal = await _financeService.UpdateGoalAsync(id, request, GetUserId());
        if (goal == null) return NotFound();
        return Ok(goal);
    }

    [HttpDelete("goals/{id}")]
    public async Task<IActionResult> DeleteGoal(int id)
    {
        var result = await _financeService.DeleteGoalAsync(id, GetUserId());
        if (!result) return NotFound();
        return NoContent();
    }

    // === Tax & Pension ===
    
    [HttpGet("tax-pension")]
    public async Task<ActionResult<TaxAndPensionSummary>> GetTaxAndPensionSummary([FromQuery] int? age = null, [FromQuery] decimal? taxRate = null)
    {
        var summary = await _financeService.GetTaxAndPensionSummaryAsync(GetUserId(), age, taxRate);
        return Ok(summary);
    }
}


