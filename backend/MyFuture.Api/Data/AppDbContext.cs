using Microsoft.EntityFrameworkCore;
using MyFuture.Api.Models;

namespace MyFuture.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Company> Companies => Set<Company>();
    public DbSet<Account> Accounts => Set<Account>();
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<Invoice> Invoices => Set<Invoice>();
    public DbSet<InvoiceLine> InvoiceLines => Set<InvoiceLine>();
    public DbSet<Voucher> Vouchers => Set<Voucher>();
    public DbSet<VoucherRow> VoucherRows => Set<VoucherRow>();
    public DbSet<Employee> Employees => Set<Employee>();
    public DbSet<Salary> Salaries => Set<Salary>();
    public DbSet<Expense> Expenses => Set<Expense>();
    public DbSet<VatPayment> VatPayments => Set<VatPayment>();
    
    // Personal Finance
    public DbSet<PersonalBudget> PersonalBudgets => Set<PersonalBudget>();
    public DbSet<FinancialAccount> FinancialAccounts => Set<FinancialAccount>();
    public DbSet<Debt> Debts => Set<Debt>();
    public DbSet<FinancialGoal> FinancialGoals => Set<FinancialGoal>();
    
    // MyGig - Freelance Marketplace
    public DbSet<Gig> Gigs => Set<Gig>();
    public DbSet<GigApplication> GigApplications => Set<GigApplication>();
    public DbSet<ConsultantProfile> ConsultantProfiles => Set<ConsultantProfile>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(e => e.Email).IsUnique();
            entity.Property(e => e.Email).HasMaxLength(255);
            entity.Property(e => e.FirstName).HasMaxLength(100);
            entity.Property(e => e.LastName).HasMaxLength(100);
        });

        // Company
        modelBuilder.Entity<Company>(entity =>
        {
            entity.HasOne(c => c.User)
                .WithMany(u => u.Companies)
                .HasForeignKey(c => c.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.Property(e => e.Name).HasMaxLength(200);
            entity.Property(e => e.OrganizationNumber).HasMaxLength(20);
        });

        // Account
        modelBuilder.Entity<Account>(entity =>
        {
            entity.HasOne(a => a.Company)
                .WithMany(c => c.Accounts)
                .HasForeignKey(a => a.CompanyId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasIndex(a => new { a.CompanyId, a.AccountNumber }).IsUnique();
        });

        // Customer
        modelBuilder.Entity<Customer>(entity =>
        {
            entity.HasOne(c => c.Company)
                .WithMany(co => co.Customers)
                .HasForeignKey(c => c.CompanyId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasIndex(c => new { c.CompanyId, c.CustomerNumber }).IsUnique();
        });

        // Invoice
        modelBuilder.Entity<Invoice>(entity =>
        {
            entity.HasOne(i => i.Company)
                .WithMany(c => c.Invoices)
                .HasForeignKey(i => i.CompanyId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(i => i.Customer)
                .WithMany(c => c.Invoices)
                .HasForeignKey(i => i.CustomerId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.HasIndex(i => new { i.CompanyId, i.InvoiceNumber }).IsUnique();
            entity.Property(e => e.TotalExcludingVat).HasPrecision(18, 2);
            entity.Property(e => e.VatAmount).HasPrecision(18, 2);
            entity.Property(e => e.TotalIncludingVat).HasPrecision(18, 2);
        });

        // InvoiceLine
        modelBuilder.Entity<InvoiceLine>(entity =>
        {
            entity.HasOne(l => l.Invoice)
                .WithMany(i => i.Lines)
                .HasForeignKey(l => l.InvoiceId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.Property(e => e.Quantity).HasPrecision(18, 4);
            entity.Property(e => e.UnitPrice).HasPrecision(18, 2);
            entity.Property(e => e.VatRate).HasPrecision(5, 2);
            entity.Property(e => e.TotalExcludingVat).HasPrecision(18, 2);
            entity.Property(e => e.VatAmount).HasPrecision(18, 2);
            entity.Property(e => e.TotalIncludingVat).HasPrecision(18, 2);
        });

        // Voucher
        modelBuilder.Entity<Voucher>(entity =>
        {
            entity.HasOne(v => v.Company)
                .WithMany(c => c.Vouchers)
                .HasForeignKey(v => v.CompanyId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasIndex(v => new { v.CompanyId, v.VoucherNumber }).IsUnique();
        });

        // VoucherRow
        modelBuilder.Entity<VoucherRow>(entity =>
        {
            entity.HasOne(r => r.Voucher)
                .WithMany(v => v.Rows)
                .HasForeignKey(r => r.VoucherId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(r => r.Account)
                .WithMany(a => a.VoucherRows)
                .HasForeignKey(r => r.AccountId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.Property(e => e.Debit).HasPrecision(18, 2);
            entity.Property(e => e.Credit).HasPrecision(18, 2);
        });

        // Employee
        modelBuilder.Entity<Employee>(entity =>
        {
            entity.HasOne(e => e.Company)
                .WithMany(c => c.Employees)
                .HasForeignKey(e => e.CompanyId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasIndex(e => new { e.CompanyId, e.EmployeeNumber }).IsUnique();
            entity.Property(e => e.MonthlySalary).HasPrecision(18, 2);
            entity.Property(e => e.TaxRate).HasPrecision(5, 2);
        });

        // Salary
        modelBuilder.Entity<Salary>(entity =>
        {
            entity.HasOne(s => s.Employee)
                .WithMany(e => e.Salaries)
                .HasForeignKey(s => s.EmployeeId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.Property(e => e.GrossSalary).HasPrecision(18, 2);
            entity.Property(e => e.TaxAmount).HasPrecision(18, 2);
            entity.Property(e => e.NetSalary).HasPrecision(18, 2);
            entity.Property(e => e.EmployerContribution).HasPrecision(18, 2);
        });

        // Expense
        modelBuilder.Entity<Expense>(entity =>
        {
            entity.HasOne(e => e.Company)
                .WithMany()
                .HasForeignKey(e => e.CompanyId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.Employee)
                .WithMany()
                .HasForeignKey(e => e.EmployeeId)
                .OnDelete(DeleteBehavior.SetNull);
            entity.HasOne(e => e.Account)
                .WithMany()
                .HasForeignKey(e => e.AccountId)
                .OnDelete(DeleteBehavior.SetNull);
            entity.Property(e => e.Amount).HasPrecision(18, 2);
            entity.Property(e => e.VatAmount).HasPrecision(18, 2);
            entity.Property(e => e.TotalAmount).HasPrecision(18, 2);
            entity.Property(e => e.VatRate).HasPrecision(5, 2);
        });

        // VatPayment
        modelBuilder.Entity<VatPayment>(entity =>
        {
            entity.HasOne(v => v.Company)
                .WithMany()
                .HasForeignKey(v => v.CompanyId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasIndex(v => new { v.CompanyId, v.Year, v.Period, v.PeriodType }).IsUnique();
            entity.Property(e => e.OutputVat).HasPrecision(18, 2);
            entity.Property(e => e.InputVat).HasPrecision(18, 2);
            entity.Property(e => e.VatToPay).HasPrecision(18, 2);
            entity.Property(e => e.PaidAmount).HasPrecision(18, 2);
        });

        // Personal Finance - PersonalBudget
        modelBuilder.Entity<PersonalBudget>(entity =>
        {
            entity.HasOne(p => p.User)
                .WithMany()
                .HasForeignKey(p => p.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.Property(e => e.Amount).HasPrecision(18, 2);
            entity.Property(e => e.Name).HasMaxLength(200);
        });

        // Personal Finance - FinancialAccount
        modelBuilder.Entity<FinancialAccount>(entity =>
        {
            entity.HasOne(f => f.User)
                .WithMany()
                .HasForeignKey(f => f.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.Property(e => e.Balance).HasPrecision(18, 2);
            entity.Property(e => e.Name).HasMaxLength(200);
            entity.Property(e => e.Institution).HasMaxLength(100);
        });

        // Personal Finance - Debt
        modelBuilder.Entity<Debt>(entity =>
        {
            entity.HasOne(d => d.User)
                .WithMany()
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.Property(e => e.OriginalAmount).HasPrecision(18, 2);
            entity.Property(e => e.CurrentBalance).HasPrecision(18, 2);
            entity.Property(e => e.AssetValue).HasPrecision(18, 2);
            entity.Property(e => e.InterestRate).HasPrecision(5, 2);
            entity.Property(e => e.MonthlyPayment).HasPrecision(18, 2);
            entity.Property(e => e.MonthlyAmortization).HasPrecision(18, 2);
            entity.Property(e => e.Name).HasMaxLength(200);
            entity.Property(e => e.Lender).HasMaxLength(100);
        });

        // Personal Finance - FinancialGoal
        modelBuilder.Entity<FinancialGoal>(entity =>
        {
            entity.HasOne(g => g.User)
                .WithMany()
                .HasForeignKey(g => g.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.Property(e => e.TargetAmount).HasPrecision(18, 2);
            entity.Property(e => e.CurrentAmount).HasPrecision(18, 2);
            entity.Property(e => e.MonthlyContribution).HasPrecision(18, 2);
            entity.Property(e => e.Name).HasMaxLength(200);
        });

        // MyGig - Gig
        modelBuilder.Entity<Gig>(entity =>
        {
            entity.HasOne(g => g.User)
                .WithMany()
                .HasForeignKey(g => g.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.Property(e => e.Title).HasMaxLength(200);
            entity.Property(e => e.Company).HasMaxLength(200);
            entity.Property(e => e.City).HasMaxLength(100);
            entity.Property(e => e.HourlyRate).HasPrecision(18, 2);
            entity.Property(e => e.MonthlyRate).HasPrecision(18, 2);
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.Category);
            entity.HasIndex(e => e.CreatedAt);
        });

        // MyGig - ConsultantProfile
        modelBuilder.Entity<ConsultantProfile>(entity =>
        {
            entity.HasOne(p => p.User)
                .WithMany()
                .HasForeignKey(p => p.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasIndex(e => e.UserId).IsUnique();
            entity.Property(e => e.Headline).HasMaxLength(200);
            entity.Property(e => e.City).HasMaxLength(100);
            entity.Property(e => e.HourlyRate).HasPrecision(18, 2);
        });

        // MyGig - GigApplication
        modelBuilder.Entity<GigApplication>(entity =>
        {
            entity.HasOne(a => a.Gig)
                .WithMany(g => g.Applications)
                .HasForeignKey(a => a.GigId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(a => a.User)
                .WithMany()
                .HasForeignKey(a => a.UserId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.HasIndex(a => new { a.GigId, a.UserId }).IsUnique();
            entity.Property(e => e.ProposedRate).HasPrecision(18, 2);
        });
    }
}

