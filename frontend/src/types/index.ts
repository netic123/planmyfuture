export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
}

export interface AuthResponse {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  token: string;
  preferredLanguage: string;
}

export interface Company {
  id: number;
  name: string;
  organizationNumber: string;
  address?: string;
  postalCode?: string;
  city?: string;
  phone?: string;
  email?: string;
  website?: string;
  bankAccount?: string;
  bankgiro?: string;
  plusgiro?: string;
  currentFiscalYear?: number;
  createdAt: string;
}

export interface Customer {
  id: number;
  customerNumber: string;
  name: string;
  organizationNumber?: string;
  address?: string;
  postalCode?: string;
  city?: string;
  country?: string;
  phone?: string;
  email?: string;
  paymentTermsDays: number;
  createdAt: string;
}

export interface Account {
  id: number;
  accountNumber: string;
  name: string;
  type: AccountType;
  isActive: boolean;
}

export enum AccountType {
  Asset = 1,
  Liability = 2,
  Revenue = 3,
  Expense = 4,
  FinancialIncome = 5,
  FinancialExpense = 6
}

export interface AccountBalance extends Account {
  debit: number;
  credit: number;
  balance: number;
}

export enum InvoiceStatus {
  Draft = 0,
  Sent = 1,
  Paid = 2,
  Overdue = 3,
  Cancelled = 4
}

export interface Invoice {
  id: number;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  status: InvoiceStatus;
  totalExcludingVat: number;
  vatAmount: number;
  totalIncludingVat: number;
  reference?: string;
  notes?: string;
  createdAt: string;
  paidAt?: string;
  customer: Customer;
  lines: InvoiceLine[];
}

export interface InvoiceList {
  id: number;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  status: InvoiceStatus;
  totalIncludingVat: number;
  customerName: string;
}

export interface InvoiceLine {
  id: number;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  vatRate: number;
  totalExcludingVat: number;
  vatAmount: number;
  totalIncludingVat: number;
}

export enum VoucherType {
  Manual = 0,
  Invoice = 1,
  Payment = 2,
  Salary = 3,
  Other = 4
}

export interface Voucher {
  id: number;
  voucherNumber: string;
  voucherDate: string;
  description: string;
  type: VoucherType;
  createdAt: string;
  rows: VoucherRow[];
}

export interface VoucherList {
  id: number;
  voucherNumber: string;
  voucherDate: string;
  description: string;
  type: VoucherType;
  totalAmount: number;
}

export interface VoucherRow {
  id: number;
  accountNumber: string;
  accountName: string;
  debit: number;
  credit: number;
  description?: string;
}

export interface Employee {
  id: number;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  fullName: string;
  personalNumber?: string;
  address?: string;
  postalCode?: string;
  city?: string;
  email?: string;
  phone?: string;
  bankAccount?: string;
  monthlySalary: number;
  taxRate: number;
  startDate: string;
  endDate?: string;
  isActive: boolean;
}

export interface Salary {
  id: number;
  employeeId: number;
  employeeName: string;
  paymentDate: string;
  year: number;
  month: number;
  grossSalary: number;
  taxAmount: number;
  netSalary: number;
  employerContribution: number;
  isPaid: boolean;
}

export interface Dashboard {
  totalRevenue: number;
  totalExpenses: number;
  profit: number;
  invoiceCount: number;
  unpaidInvoices: number;
  unpaidAmount: number;
  customerCount: number;
  employeeCount: number;
  monthlyRevenue: MonthlyRevenue[];
}

export interface MonthlyRevenue {
  year: number;
  month: number;
  monthName: string;
  revenue: number;
  expenses: number;
}

export interface IncomeStatement {
  fromDate: string;
  toDate: string;
  revenueAccounts: IncomeStatementRow[];
  totalRevenue: number;
  expenseAccounts: IncomeStatementRow[];
  totalExpenses: number;
  netIncome: number;
}

export interface IncomeStatementRow {
  accountNumber: string;
  accountName: string;
  amount: number;
}

export interface BalanceSheet {
  asOfDate: string;
  assets: BalanceSheetRow[];
  totalAssets: number;
  liabilities: BalanceSheetRow[];
  totalLiabilities: number;
  equity: number;
  totalLiabilitiesAndEquity: number;
}

export interface BalanceSheetRow {
  accountNumber: string;
  accountName: string;
  balance: number;
}

export interface VatReport {
  fromDate: string;
  toDate: string;
  outputVat: number;
  inputVat: number;
  vatToPay: number;
}

export enum ExpenseStatus {
  Draft = 0,
  Submitted = 1,
  Approved = 2,
  Paid = 3,
  Rejected = 4
}

export enum ExpenseCategory {
  Travel = 0,
  Accommodation = 1,
  Meals = 2,
  Entertainment = 3,
  Materials = 4,
  Software = 5,
  Equipment = 6,
  Phone = 7,
  Other = 8
}

export interface Expense {
  id: number;
  description: string;
  amount: number;
  vatAmount: number;
  totalAmount: number;
  vatRate: number;
  expenseDate: string;
  category: ExpenseCategory;
  status: ExpenseStatus;
  receiptNumber?: string;
  notes?: string;
  supplier?: string;
  createdAt: string;
  approvedAt?: string;
  paidAt?: string;
  employeeId?: number;
  employeeName?: string;
  accountId?: number;
  accountName?: string;
}

export interface ExpenseList {
  id: number;
  description: string;
  totalAmount: number;
  expenseDate: string;
  category: ExpenseCategory;
  status: ExpenseStatus;
  supplier?: string;
  employeeName?: string;
}

// Bokslut & Skatt
export interface YearEndSummary {
  fiscalYear: number;
  fromDate: string;
  toDate: string;
  isClosed: boolean;
  totalRevenue: number;
  totalExpenses: number;
  operatingResult: number;
  financialIncome: number;
  financialExpenses: number;
  resultBeforeTax: number;
  corporateTax: number;
  netResult: number;
  totalAssets: number;
  totalLiabilities: number;
  equity: number;
  revenueAccounts: AccountSummaryRow[];
  expenseAccounts: AccountSummaryRow[];
  assetAccounts: AccountSummaryRow[];
  liabilityAccounts: AccountSummaryRow[];
}

export interface AccountSummaryRow {
  accountNumber: string;
  accountName: string;
  amount: number;
}

export interface TaxCalculation {
  fiscalYear: number;
  resultBeforeTax: number;
  taxableIncome: number;
  corporateTaxRate: number;
  corporateTax: number;
  outputVat: number;
  inputVat: number;
  vatToPay: number;
  totalGrossSalaries: number;
  totalEmployerContributions: number;
  employerContributionRate: number;
  totalEmployeeTax: number;
  totalTaxLiabilities: number;
}

export interface CloseYearResult {
  success: boolean;
  message: string;
  newFiscalYear?: number;
}

// Momshantering
export enum VatPeriodType {
  Monthly = 0,
  Quarterly = 1,
  Yearly = 2
}

export interface VatPeriod {
  year: number;
  period: number;
  periodType: VatPeriodType;
  periodName: string;
  fromDate: string;
  toDate: string;
  outputVat: number;
  inputVat: number;
  vatToPay: number;
  isPaid: boolean;
  paidAt?: string;
  paidAmount?: number;
  paymentReference?: string;
  notes?: string;
}

export interface VatSummary {
  year: number;
  periodType: VatPeriodType;
  periods: VatPeriod[];
  totalOutputVat: number;
  totalInputVat: number;
  totalVatToPay: number;
  totalPaid: number;
  remaining: number;
}

export interface MarkVatPaidRequest {
  year: number;
  period: number;
  periodType: VatPeriodType;
  paidAmount?: number;
  paymentReference?: string;
  notes?: string;
}

// ============ Personal Finance Types ============

export enum BudgetItemType {
  Income = 0,
  Expense = 1
}

export enum BudgetCategory {
  Salary = 0,
  Interest = 1,
  Rent = 2,
  Amortization = 3,
  Food = 4,
  Transportation = 5,
  Insurance = 6,
  Utilities = 7,
  Entertainment = 8,
  Savings = 9,
  Other = 10
}

export interface PersonalBudgetItem {
  id: number;
  name: string;
  amount: number;
  type: BudgetItemType;
  category: BudgetCategory;
  isRecurring: boolean;
  notes?: string;
  sortOrder: number;
}

export interface BudgetSummary {
  incomeItems: PersonalBudgetItem[];
  expenseItems: PersonalBudgetItem[];
  totalIncome: number;
  totalExpenses: number;
  balance: number;
}

export enum FinancialAccountCategory {
  Cash = 0,
  BankAccount = 1,
  Savings = 2,
  Investment = 3,
  Pension = 4,
  RealEstate = 5,
  Business = 6,
  Crypto = 7,
  Other = 8
}

export interface FinancialAccount {
  id: number;
  name: string;
  institution?: string;
  balance: number;
  category: FinancialAccountCategory;
  accountNumber?: string;
  color?: string;
  icon?: string;
  sortOrder: number;
  isActive: boolean;
  notes?: string;
  lastBalanceUpdate?: string;
}

export enum DebtType {
  Mortgage = 0,
  StudentLoan = 1,
  CarLoan = 2,
  PersonalLoan = 3,
  CreditCard = 4,
  TaxDebt = 5,
  BusinessLoan = 6,
  Other = 7
}

export interface Debt {
  id: number;
  name: string;
  lender?: string;
  type: DebtType;
  originalAmount: number;
  currentBalance: number;
  assetValue?: number;
  interestRate: number;
  amortizationRate?: number;
  monthlyPayment?: number;
  monthlyAmortization?: number;
  monthlyInterest: number;
  calculatedMonthlyAmortization: number;
  startDate?: string;
  endDate?: string;
  nextPaymentDate?: string;
  color?: string;
  sortOrder: number;
  isActive: boolean;
  notes?: string;
  remainingPercentage: number;
  equityInAsset: number;
}

export enum GoalType {
  Savings = 0,
  DebtPayoff = 1,
  Investment = 2,
  Emergency = 3,
  Retirement = 4,
  Purchase = 5,
  Other = 6
}

export interface FinancialGoal {
  id: number;
  name: string;
  description?: string;
  type: GoalType;
  targetAmount: number;
  currentAmount: number;
  monthlyContribution?: number;
  targetDate?: string;
  startDate?: string;
  color?: string;
  icon?: string;
  sortOrder: number;
  isCompleted: boolean;
  completedAt?: string;
  progressPercentage: number;
  remainingAmount: number;
  monthsToGoal?: number;
}

export interface AssetCategorySummary {
  category: FinancialAccountCategory;
  categoryName: string;
  totalBalance: number;
  accountCount: number;
}

export interface DebtTypeSummary {
  type: DebtType;
  typeName: string;
  totalBalance: number;
  totalOriginalAmount: number;
  totalEquity: number;
  debtCount: number;
  remainingPercentage: number;
}

export interface FinancialProjection {
  years: number;
  totalCosts: number;
  totalSaved: number;
  projectedNetWorth: number;
  totalInterestPaid: number;
  totalAmortization: number;
  remainingDebt: number;
  projectedSavingsWithInterest: number;
}

export interface PersonalFinanceSummary {
  totalAssets: number;
  totalDebts: number;
  netWorth: number;
  totalMonthlyIncome: number;
  totalMonthlyExpenses: number;
  monthlyBalance: number;
  totalDebtRemaining: number;
  averageDebtPercentage: number;
  housingDebtPercentage: number;
  personalDebtPercentage: number;
  totalDebtPercentage: number;
  assetsByCategory: AssetCategorySummary[];
  debtsByType: DebtTypeSummary[];
  projections: FinancialProjection[];
}

// Tax & Pension types
export interface PensionProjection {
  age: number;
  yearsFromNow: number;
  projectedPensionCapital: number;
  estimatedMonthlyPension: number;
  estimatedYearlyPension: number;
}

export interface TaxAndPensionSummary {
  grossMonthlyIncome: number;
  grossYearlyIncome: number;
  monthlyTax: number;
  yearlyTax: number;
  effectiveTaxRate: number;
  netMonthlyIncome: number;
  netYearlyIncome: number;
  monthlyEmployerContributions: number;
  yearlyEmployerContributions: number;
  monthlyPensionContribution: number;
  yearlyPensionContribution: number;
  currentPensionSavings: number;
  pensionProjections: PensionProjection[];
  estimatedYearlyDeductions: number;
  estimatedTaxRefund: number;
  totalEmployerCost: number;
}

