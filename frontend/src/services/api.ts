import axios from 'axios';
import type { 
  AuthResponse, 
  Company, 
  Customer, 
  Account,
  AccountBalance,
  InvoiceList,
  Invoice,
  VoucherList,
  Voucher,
  Employee,
  Salary,
  Dashboard,
  IncomeStatement,
  BalanceSheet,
  VatReport,
  ExpenseList,
  Expense,
  YearEndSummary,
  TaxCalculation,
  CloseYearResult,
  VatSummary,
  VatPeriod,
  MarkVatPaidRequest,
  PersonalFinanceSummary,
  BudgetSummary,
  PersonalBudgetItem,
  FinancialAccount,
  Debt,
  FinancialGoal,
  TaxAndPensionSummary
} from '../types';
import { VatPeriodType } from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors (but not for auth endpoints - those should show error messages)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthEndpoint = error.config?.url?.startsWith('/auth/');
    if (error.response?.status === 401 && !isAuthEndpoint) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
    return data;
  },
  register: async (email: string, password: string, firstName: string, lastName: string): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/register', { email, password, firstName, lastName });
    return data;
  },
  updateLanguage: async (language: string): Promise<void> => {
    await api.put('/auth/language', { language });
  },
  forgotPassword: async (email: string): Promise<void> => {
    await api.post('/auth/forgot-password', { email });
  },
  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    await api.post('/auth/reset-password', { token, newPassword });
  },
};

// Companies
export const companiesApi = {
  getAll: async (): Promise<Company[]> => {
    const { data } = await api.get<Company[]>('/companies');
    return data;
  },
  get: async (id: number): Promise<Company> => {
    const { data } = await api.get<Company>(`/companies/${id}`);
    return data;
  },
  create: async (company: Partial<Company>): Promise<Company> => {
    const { data } = await api.post<Company>('/companies', company);
    return data;
  },
  update: async (id: number, company: Partial<Company>): Promise<Company> => {
    const { data } = await api.put<Company>(`/companies/${id}`, company);
    return data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/companies/${id}`);
  },
};

// Customers
export const customersApi = {
  getAll: async (companyId: number): Promise<Customer[]> => {
    const { data } = await api.get<Customer[]>(`/companies/${companyId}/customers`);
    return data;
  },
  get: async (companyId: number, id: number): Promise<Customer> => {
    const { data } = await api.get<Customer>(`/companies/${companyId}/customers/${id}`);
    return data;
  },
  create: async (companyId: number, customer: Partial<Customer>): Promise<Customer> => {
    const { data } = await api.post<Customer>(`/companies/${companyId}/customers`, customer);
    return data;
  },
  update: async (companyId: number, id: number, customer: Partial<Customer>): Promise<Customer> => {
    const { data } = await api.put<Customer>(`/companies/${companyId}/customers/${id}`, customer);
    return data;
  },
  delete: async (companyId: number, id: number): Promise<void> => {
    await api.delete(`/companies/${companyId}/customers/${id}`);
  },
};

// Accounts
export const accountsApi = {
  getAll: async (companyId: number): Promise<Account[]> => {
    const { data } = await api.get<Account[]>(`/companies/${companyId}/accounts`);
    return data;
  },
  getBalances: async (companyId: number, asOfDate?: string): Promise<AccountBalance[]> => {
    const params = asOfDate ? { asOfDate } : {};
    const { data } = await api.get<AccountBalance[]>(`/companies/${companyId}/accounts/balances`, { params });
    return data;
  },
  create: async (companyId: number, account: Partial<Account>): Promise<Account> => {
    const { data } = await api.post<Account>(`/companies/${companyId}/accounts`, account);
    return data;
  },
  delete: async (companyId: number, id: number): Promise<void> => {
    await api.delete(`/companies/${companyId}/accounts/${id}`);
  },
};

// Invoices
export const invoicesApi = {
  getAll: async (companyId: number): Promise<InvoiceList[]> => {
    const { data } = await api.get<InvoiceList[]>(`/companies/${companyId}/invoices`);
    return data;
  },
  get: async (companyId: number, id: number): Promise<Invoice> => {
    const { data } = await api.get<Invoice>(`/companies/${companyId}/invoices/${id}`);
    return data;
  },
  create: async (companyId: number, invoice: unknown): Promise<Invoice> => {
    const { data } = await api.post<Invoice>(`/companies/${companyId}/invoices`, invoice);
    return data;
  },
  update: async (companyId: number, id: number, invoice: unknown): Promise<Invoice> => {
    const { data } = await api.put<Invoice>(`/companies/${companyId}/invoices/${id}`, invoice);
    return data;
  },
  delete: async (companyId: number, id: number): Promise<void> => {
    await api.delete(`/companies/${companyId}/invoices/${id}`);
  },
  send: async (companyId: number, id: number): Promise<void> => {
    await api.post(`/companies/${companyId}/invoices/${id}/send`);
  },
  markAsPaid: async (companyId: number, id: number): Promise<void> => {
    await api.post(`/companies/${companyId}/invoices/${id}/pay`);
  },
};

// Vouchers
export const vouchersApi = {
  getAll: async (companyId: number): Promise<VoucherList[]> => {
    const { data } = await api.get<VoucherList[]>(`/companies/${companyId}/vouchers`);
    return data;
  },
  get: async (companyId: number, id: number): Promise<Voucher> => {
    const { data } = await api.get<Voucher>(`/companies/${companyId}/vouchers/${id}`);
    return data;
  },
  create: async (companyId: number, voucher: unknown): Promise<Voucher> => {
    const { data } = await api.post<Voucher>(`/companies/${companyId}/vouchers`, voucher);
    return data;
  },
  delete: async (companyId: number, id: number): Promise<void> => {
    await api.delete(`/companies/${companyId}/vouchers/${id}`);
  },
};

// Employees
export const employeesApi = {
  getAll: async (companyId: number): Promise<Employee[]> => {
    const { data } = await api.get<Employee[]>(`/companies/${companyId}/employees`);
    return data;
  },
  get: async (companyId: number, id: number): Promise<Employee> => {
    const { data } = await api.get<Employee>(`/companies/${companyId}/employees/${id}`);
    return data;
  },
  create: async (companyId: number, employee: Partial<Employee>): Promise<Employee> => {
    const { data } = await api.post<Employee>(`/companies/${companyId}/employees`, employee);
    return data;
  },
  update: async (companyId: number, id: number, employee: Partial<Employee>): Promise<Employee> => {
    const { data } = await api.put<Employee>(`/companies/${companyId}/employees/${id}`, employee);
    return data;
  },
  delete: async (companyId: number, id: number): Promise<void> => {
    await api.delete(`/companies/${companyId}/employees/${id}`);
  },
  getSalaries: async (companyId: number, year?: number, month?: number): Promise<Salary[]> => {
    const params: Record<string, number> = {};
    if (year) params.year = year;
    if (month) params.month = month;
    const { data } = await api.get<Salary[]>(`/companies/${companyId}/employees/salaries`, { params });
    return data;
  },
  createSalary: async (companyId: number, salary: { employeeId: number; year: number; month: number; paymentDate: string }): Promise<Salary> => {
    const { data } = await api.post<Salary>(`/companies/${companyId}/employees/salaries`, salary);
    return data;
  },
  markSalaryAsPaid: async (companyId: number, salaryId: number): Promise<void> => {
    await api.post(`/companies/${companyId}/employees/salaries/${salaryId}/pay`);
  },
};

// Expenses
export const expensesApi = {
  getAll: async (companyId: number): Promise<ExpenseList[]> => {
    const { data } = await api.get<ExpenseList[]>(`/companies/${companyId}/expenses`);
    return data;
  },
  get: async (companyId: number, id: number): Promise<Expense> => {
    const { data } = await api.get<Expense>(`/companies/${companyId}/expenses/${id}`);
    return data;
  },
  create: async (companyId: number, expense: unknown): Promise<Expense> => {
    const { data } = await api.post<Expense>(`/companies/${companyId}/expenses`, expense);
    return data;
  },
  update: async (companyId: number, id: number, expense: unknown): Promise<Expense> => {
    const { data } = await api.put<Expense>(`/companies/${companyId}/expenses/${id}`, expense);
    return data;
  },
  delete: async (companyId: number, id: number): Promise<void> => {
    await api.delete(`/companies/${companyId}/expenses/${id}`);
  },
  submit: async (companyId: number, id: number): Promise<void> => {
    await api.post(`/companies/${companyId}/expenses/${id}/submit`);
  },
  approve: async (companyId: number, id: number): Promise<void> => {
    await api.post(`/companies/${companyId}/expenses/${id}/approve`);
  },
  reject: async (companyId: number, id: number): Promise<void> => {
    await api.post(`/companies/${companyId}/expenses/${id}/reject`);
  },
  markAsPaid: async (companyId: number, id: number): Promise<void> => {
    await api.post(`/companies/${companyId}/expenses/${id}/pay`);
  },
};

// Reports
export const reportsApi = {
  getDashboard: async (companyId: number): Promise<Dashboard> => {
    const { data } = await api.get<Dashboard>(`/companies/${companyId}/reports/dashboard`);
    return data;
  },
  getIncomeStatement: async (companyId: number, fromDate?: string, toDate?: string): Promise<IncomeStatement> => {
    const params: Record<string, string> = {};
    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;
    const { data } = await api.get<IncomeStatement>(`/companies/${companyId}/reports/income-statement`, { params });
    return data;
  },
  getBalanceSheet: async (companyId: number, asOfDate?: string): Promise<BalanceSheet> => {
    const params = asOfDate ? { asOfDate } : {};
    const { data } = await api.get<BalanceSheet>(`/companies/${companyId}/reports/balance-sheet`, { params });
    return data;
  },
  getVatReport: async (companyId: number, fromDate?: string, toDate?: string): Promise<VatReport> => {
    const params: Record<string, string> = {};
    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;
    const { data } = await api.get<VatReport>(`/companies/${companyId}/reports/vat`, { params });
    return data;
  },
};

// Year-End / Bokslut & Skatt
export const yearEndApi = {
  getSummary: async (companyId: number, fiscalYear: number): Promise<YearEndSummary> => {
    const { data } = await api.get<YearEndSummary>(`/companies/${companyId}/year-end/${fiscalYear}`);
    return data;
  },
  getTaxCalculation: async (companyId: number, fiscalYear: number): Promise<TaxCalculation> => {
    const { data } = await api.get<TaxCalculation>(`/companies/${companyId}/year-end/${fiscalYear}/tax`);
    return data;
  },
  closeYear: async (companyId: number, fiscalYear: number): Promise<CloseYearResult> => {
    const { data } = await api.post<CloseYearResult>(`/companies/${companyId}/year-end/${fiscalYear}/close`);
    return data;
  },
};

// VAT / Moms
export const vatApi = {
  getSummary: async (companyId: number, year: number, periodType: VatPeriodType = VatPeriodType.Quarterly): Promise<VatSummary> => {
    const { data } = await api.get<VatSummary>(`/companies/${companyId}/vat/${year}`, { params: { periodType } });
    return data;
  },
  markAsPaid: async (companyId: number, request: MarkVatPaidRequest): Promise<VatPeriod> => {
    const { data } = await api.post<VatPeriod>(`/companies/${companyId}/vat/mark-paid`, request);
    return data;
  },
  unmarkAsPaid: async (companyId: number, year: number, period: number, periodType: VatPeriodType): Promise<void> => {
    await api.post(`/companies/${companyId}/vat/${year}/${period}/unmark-paid`, null, { params: { periodType } });
  },
};

// Personal Finance API
export const personalFinanceApi = {
  // Summary / Dashboard
  getSummary: async (): Promise<PersonalFinanceSummary> => {
    const { data } = await api.get<PersonalFinanceSummary>('/personal-finance/summary');
    return data;
  },

  // Budget
  getBudgetSummary: async (): Promise<BudgetSummary> => {
    const { data } = await api.get<BudgetSummary>('/personal-finance/budget');
    return data;
  },
  getBudgetItems: async (): Promise<PersonalBudgetItem[]> => {
    const { data } = await api.get<PersonalBudgetItem[]>('/personal-finance/budget/items');
    return data;
  },
  createBudgetItem: async (item: Omit<PersonalBudgetItem, 'id'>): Promise<PersonalBudgetItem> => {
    const { data } = await api.post<PersonalBudgetItem>('/personal-finance/budget/items', item);
    return data;
  },
  updateBudgetItem: async (id: number, item: Omit<PersonalBudgetItem, 'id'>): Promise<PersonalBudgetItem> => {
    const { data } = await api.put<PersonalBudgetItem>(`/personal-finance/budget/items/${id}`, item);
    return data;
  },
  deleteBudgetItem: async (id: number): Promise<void> => {
    await api.delete(`/personal-finance/budget/items/${id}`);
  },

  // Financial Accounts
  getAccounts: async (): Promise<FinancialAccount[]> => {
    const { data } = await api.get<FinancialAccount[]>('/personal-finance/accounts');
    return data;
  },
  getAccount: async (id: number): Promise<FinancialAccount> => {
    const { data } = await api.get<FinancialAccount>(`/personal-finance/accounts/${id}`);
    return data;
  },
  createAccount: async (account: Omit<FinancialAccount, 'id' | 'isActive' | 'lastBalanceUpdate'>): Promise<FinancialAccount> => {
    const { data } = await api.post<FinancialAccount>('/personal-finance/accounts', account);
    return data;
  },
  updateAccount: async (id: number, account: Omit<FinancialAccount, 'id' | 'lastBalanceUpdate'>): Promise<FinancialAccount> => {
    const { data } = await api.put<FinancialAccount>(`/personal-finance/accounts/${id}`, account);
    return data;
  },
  deleteAccount: async (id: number): Promise<void> => {
    await api.delete(`/personal-finance/accounts/${id}`);
  },

  // Debts
  getDebts: async (): Promise<Debt[]> => {
    const { data } = await api.get<Debt[]>('/personal-finance/debts');
    return data;
  },
  getDebt: async (id: number): Promise<Debt> => {
    const { data } = await api.get<Debt>(`/personal-finance/debts/${id}`);
    return data;
  },
  createDebt: async (debt: Partial<Debt>): Promise<Debt> => {
    const { data } = await api.post<Debt>('/personal-finance/debts', debt);
    return data;
  },
  updateDebt: async (id: number, debt: Partial<Debt>): Promise<Debt> => {
    const { data } = await api.put<Debt>(`/personal-finance/debts/${id}`, debt);
    return data;
  },
  deleteDebt: async (id: number): Promise<void> => {
    await api.delete(`/personal-finance/debts/${id}`);
  },

  // Goals
  getGoals: async (): Promise<FinancialGoal[]> => {
    const { data } = await api.get<FinancialGoal[]>('/personal-finance/goals');
    return data;
  },
  getGoal: async (id: number): Promise<FinancialGoal> => {
    const { data } = await api.get<FinancialGoal>(`/personal-finance/goals/${id}`);
    return data;
  },
  createGoal: async (goal: Partial<FinancialGoal>): Promise<FinancialGoal> => {
    const { data } = await api.post<FinancialGoal>('/personal-finance/goals', goal);
    return data;
  },
  updateGoal: async (id: number, goal: Partial<FinancialGoal>): Promise<FinancialGoal> => {
    const { data } = await api.put<FinancialGoal>(`/personal-finance/goals/${id}`, goal);
    return data;
  },
  deleteGoal: async (id: number): Promise<void> => {
    await api.delete(`/personal-finance/goals/${id}`);
  },

  // Tax & Pension
  getTaxAndPension: async (age?: number, taxRate?: number): Promise<TaxAndPensionSummary> => {
    const params: Record<string, number> = {};
    if (age) params.age = age;
    if (taxRate) params.taxRate = taxRate;
    const { data } = await api.get<TaxAndPensionSummary>('/personal-finance/tax-pension', { params });
    return data;
  },
};

// MyGig API
export const gigApi = {
  // Gigs
  searchGigs: async (params: GigSearchParams): Promise<GigSearchResult> => {
    const { data } = await api.get<GigSearchResult>('/gigs/search', { params });
    return data;
  },
  getGig: async (id: number): Promise<GigDto> => {
    const { data } = await api.get<GigDto>(`/gigs/${id}`);
    return data;
  },
  createGig: async (gig: CreateGigRequest): Promise<GigDto> => {
    const { data } = await api.post<GigDto>('/gigs', gig);
    return data;
  },
  updateGig: async (id: number, gig: UpdateGigRequest): Promise<GigDto> => {
    const { data } = await api.put<GigDto>(`/gigs/${id}`, gig);
    return data;
  },
  deleteGig: async (id: number): Promise<void> => {
    await api.delete(`/gigs/${id}`);
  },
  publishGig: async (id: number): Promise<void> => {
    await api.post(`/gigs/${id}/publish`);
  },
  closeGig: async (id: number): Promise<void> => {
    await api.post(`/gigs/${id}/close`);
  },
  getMyGigs: async (): Promise<GigDto[]> => {
    const { data } = await api.get<GigDto[]>('/gigs/my-gigs');
    return data;
  },

  // Applications
  applyToGig: async (gigId: number, application: ApplyToGigRequest): Promise<GigApplicationDto> => {
    const { data } = await api.post<GigApplicationDto>(`/gigs/${gigId}/apply`, application);
    return data;
  },
  getApplicationsForGig: async (gigId: number): Promise<GigApplicationDto[]> => {
    const { data } = await api.get<GigApplicationDto[]>(`/gigs/${gigId}/applications`);
    return data;
  },
  getMyApplications: async (): Promise<GigApplicationDto[]> => {
    const { data } = await api.get<GigApplicationDto[]>('/gigs/my-applications');
    return data;
  },
  updateApplicationStatus: async (applicationId: number, status: string, statusNote?: string): Promise<void> => {
    await api.put(`/gigs/applications/${applicationId}/status`, { status, statusNote });
  },
  withdrawApplication: async (applicationId: number): Promise<void> => {
    await api.post(`/gigs/applications/${applicationId}/withdraw`);
  },

  // Profiles
  getMyProfile: async (): Promise<ConsultantProfileDto> => {
    const { data } = await api.get<ConsultantProfileDto>('/gigs/profile');
    return data;
  },
  getProfile: async (id: number): Promise<ConsultantProfileDto> => {
    const { data } = await api.get<ConsultantProfileDto>(`/gigs/profiles/${id}`);
    return data;
  },
  createOrUpdateProfile: async (profile: CreateProfileRequest): Promise<ConsultantProfileDto> => {
    const { data } = await api.post<ConsultantProfileDto>('/gigs/profile', profile);
    return data;
  },
  searchConsultants: async (params: ConsultantSearchParams): Promise<ConsultantSearchResult> => {
    const { data } = await api.get<ConsultantSearchResult>('/gigs/profiles/search', { params });
    return data;
  },
};

// Gig Types
export interface GigSearchParams {
  query?: string;
  category?: number;
  locationType?: number;
  city?: string;
  minRate?: number;
  maxRate?: number;
  page?: number;
  pageSize?: number;
}

export interface GigSearchResult {
  gigs: GigListDto[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface GigListDto {
  id: number;
  title: string;
  company: string;
  category: number;
  categoryName: string;
  locationType: number;
  locationTypeName: string;
  city?: string;
  startDate?: string;
  durationMonths?: number;
  hoursPerWeek?: number;
  hourlyRate?: number;
  monthlyRate?: number;
  createdAt: string;
  applicationCount: number;
  skills: string[];
}

export interface GigDto extends GigListDto {
  userId: number;
  description: string;
  status: number;
  statusName: string;
  expiresAt?: string;
  viewCount: number;
  contactEmail?: string;
  contactPhone?: string;
  posterName: string;
  isOwner: boolean;
}

export interface CreateGigRequest {
  title: string;
  description: string;
  company: string;
  category: number;
  skills: string;
  locationType: number;
  city?: string;
  startDate?: string;
  durationMonths?: number;
  hoursPerWeek?: number;
  hourlyRate?: number;
  monthlyRate?: number;
  contactEmail?: string;
  contactPhone?: string;
  publish?: boolean;
}

export interface UpdateGigRequest extends CreateGigRequest {}

export interface ApplyToGigRequest {
  coverLetter: string;
  proposedRate?: number;
  availableFrom?: string;
}

export interface GigApplicationDto {
  id: number;
  gigId: number;
  gigTitle: string;
  gigCompany: string;
  userId: number;
  applicantName: string;
  applicantHeadline?: string;
  coverLetter: string;
  proposedRate?: number;
  availableFrom?: string;
  status: number;
  statusName: string;
  appliedAt: string;
  reviewedAt?: string;
}

export interface ConsultantProfileDto {
  id: number;
  userId: number;
  name: string;
  headline: string;
  summary: string;
  profileImageUrl?: string;
  skills: string[];
  yearsOfExperience: number;
  currentTitle?: string;
  currentCompany?: string;
  city?: string;
  isAvailable: boolean;
  availableFrom?: string;
  preferredLocationType: number;
  preferredLocationTypeName: string;
  hourlyRate?: number;
  linkedInUrl?: string;
  email?: string;
  phone?: string;
  website?: string;
  createdAt: string;
}

export interface CreateProfileRequest {
  headline: string;
  summary: string;
  skills: string;
  yearsOfExperience: number;
  currentTitle?: string;
  currentCompany?: string;
  city?: string;
  isAvailable: boolean;
  availableFrom?: string;
  preferredLocationType: number;
  hourlyRate?: number;
  linkedInUrl?: string;
  email?: string;
  phone?: string;
  website?: string;
}

export interface ConsultantSearchParams {
  query?: string;
  skills?: string;
  locationType?: number;
  city?: string;
  isAvailable?: boolean;
  page?: number;
  pageSize?: number;
}

export interface ConsultantSearchResult {
  consultants: ConsultantProfileDto[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export default api;

